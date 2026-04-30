import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../apiClient';
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, CircleDot, LayoutGrid, Plus, Trash2, Users, User, Clock3, X } from 'lucide-react';

const statusMeta = {
  Todo: { label: 'To Do', color: 'var(--text-muted)' },
  'In Progress': { label: 'In Progress', color: 'var(--warning)' },
  Done: { label: 'Done', color: 'var(--success)' }
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [memberActionLoading, setMemberActionLoading] = useState(false);
  const [memberActionError, setMemberActionError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', description: '', priority: 'Medium', dueDate: '' });
  const [teammates, setTeammates] = useState([]);
  const [loadingTeammates, setLoadingTeammates] = useState(false);
  const [taskActionLoading, setTaskActionLoading] = useState(false);
  const [taskActionError, setTaskActionError] = useState('');

  const loadProject = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      loadProject();
    }
  }, [user, id]);

  const taskSummaryCards = useMemo(() => {
    if (!project?.taskSummary) return [];

    return [
      { label: 'Total Tasks', value: project.taskSummary.total, icon: LayoutGrid, color: 'var(--primary)', bg: 'rgba(99,102,241,0.15)' },
      { label: 'To Do', value: project.taskSummary.Todo, icon: CircleDot, color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.15)' },
      { label: 'In Progress', value: project.taskSummary['In Progress'], icon: Clock3, color: 'var(--warning)', bg: 'rgba(245,158,11,0.15)' },
      { label: 'Done', value: project.taskSummary.Done, icon: CheckCircle2, color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' }
    ];
  }, [project]);

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this project?`)) return;

    try {
      await api.delete(`/projects/${project.id}/members/${memberId}`);
      await loadProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberEmail.trim()) {
      setMemberActionError('Email is required');
      return;
    }

    try {
      setMemberActionLoading(true);
      setMemberActionError('');

      await api.post(`/projects/${project.id}/members`, {
        email: memberEmail.trim(),
        role: memberRole
      });

      setMemberEmail('');
      setMemberRole('Member');
      setShowAddMemberModal(false);
      await loadProject();
    } catch (err) {
      setMemberActionError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const openTaskModal = async () => {
    setTaskActionError('');
    setTaskForm({ title: '', assignee: '', description: '', priority: 'Medium', dueDate: '' });
    setShowTaskModal(true);
    setLoadingTeammates(true);

    try {
      const { data } = await api.get(`/projects/${id}/teammates`);
      setTeammates(Array.isArray(data) ? data : []);
    } catch (err) {
      setTeammates([]);
      setTaskActionError(err.response?.data?.message || 'Failed to load teammates');
    } finally {
      setLoadingTeammates(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      setTaskActionError('Task title is required');
      return;
    }

    try {
      setTaskActionLoading(true);
      setTaskActionError('');

      await api.post('/tasks', {
        title: taskForm.title.trim(),
        project: id,
        assignee: taskForm.assignee || '',
        description: taskForm.description || '',
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || ''
      });

      setShowTaskModal(false);
      await loadProject();
    } catch (err) {
      setTaskActionError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setTaskActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading project details...</div>;
  }

  if (error) {
    return (
      <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Back to projects
        </button>
      </div>
    );
  }

  if (!project) return null;

  const topTasks = [...(project.tasks || [])].slice(0, 6);

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: '16px' }} onClick={() => navigate('/projects')}>
            <ArrowLeft size={16} /> Back
          </button>
          {user?.role === 'Admin' && (
            <button
              className="btn btn-primary"
              style={{ marginBottom: '16px', marginLeft: '12px' }}
              onClick={openTaskModal}
            >
              <Plus size={16} /> New Task
            </button>
          )}
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.5px' }}>PROJECT DETAILS</p>
          <h1 style={{ fontSize: '34px', fontWeight: '800', color: 'var(--text-main)' }}>{project.name}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '760px' }}>
            {project.description || 'No description provided for this project.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="glass" style={{ padding: '14px 18px', borderRadius: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Owner</p>
            <p style={{ fontSize: '14px', fontWeight: '700' }}>{project.owner?.name || 'Unknown'}</p>
          </div>
          <div className="glass" style={{ padding: '14px 18px', borderRadius: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Members</p>
            <p style={{ fontSize: '14px', fontWeight: '700' }}>{project.memberCount || 0}</p>
          </div>
          <div className="glass" style={{ padding: '14px 18px', borderRadius: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tasks</p>
            <p style={{ fontSize: '14px', fontWeight: '700' }}>{project.taskSummary?.total || 0}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {taskSummaryCards.map(card => (
          <div key={card.label} className="glass" style={{ padding: '20px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '180px', flex: '1' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '800' }}>{card.value}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Members</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{project.memberCount || 0} total</span>
              {project.canManageMembers && (
                <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={() => {
                  setMemberActionError('');
                  setMemberEmail('');
                  setMemberRole('Member');
                  setShowAddMemberModal(true);
                }}>
                  <Plus size={14} /> Add Member
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(project.members || []).map(member => {
              const isOwner = project.owner?.id === member.id;
              return (
                <div key={member.id} className="glass" style={{ padding: '14px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar" style={{ width: '36px', height: '36px' }}>
                      {member.name?.charAt(0)?.toUpperCase() || <User size={14} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '700' }}>{member.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`task-priority ${member.membershipRole === 'Admin' ? 'priority-high' : 'priority-medium'}`}>
                      {isOwner ? 'Owner' : member.membershipRole}
                    </span>
                    {project.canManageMembers && !isOwner && (
                      <button className="btn btn-secondary" onClick={() => handleRemoveMember(member.id, member.name)} style={{ padding: '8px 12px' }}>
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {(project.members || []).length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No members found on this project.</p>
            )}
          </div>
        </div>

        <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Briefcase size={18} color="var(--secondary)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Project Info</h3>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Project ID</p>
              <p style={{ fontSize: '14px', fontWeight: '600', wordBreak: 'break-all' }}>{project.id}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Created For</p>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>{project.owner?.name || 'Unknown'}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Tasks Overview</p>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>
                {project.taskSummary?.Todo || 0} open, {project.taskSummary?.['In Progress'] || 0} in progress, {project.taskSummary?.Done || 0} done
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="var(--warning)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Tasks in This Project</h3>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{project.tasks?.length || 0} tasks</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topTasks.map(task => (
            <div key={task.id} className="glass" style={{ padding: '16px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{task.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{task.description || 'No description provided.'}</p>
                </div>
                <span className={`task-priority priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '14px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <span style={{ color: statusMeta[task.status]?.color || 'var(--text-muted)', fontWeight: '700' }}>{statusMeta[task.status]?.label || task.status}</span>
                <span>{task.assignee?.name || 'Unassigned'}</span>
                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
              </div>
            </div>
          ))}

          {(project.tasks || []).length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No tasks have been added to this project yet.</p>
          )}
        </div>
      </div>

      {showAddMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Add Member</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Enter the email of an existing user.</p>
              </div>
              <button className="btn btn-secondary" style={{ padding: '8px 10px' }} onClick={() => setShowAddMemberModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="input-group">
                <label>Project Role</label>
                <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {memberActionError && (
                <p style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '14px' }}>{memberActionError}</p>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddMemberModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={memberActionLoading}>
                  {memberActionLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Create New Task</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Add a task to {project.name}.</p>
              </div>
              <button className="btn btn-secondary" style={{ padding: '8px 10px' }} onClick={() => setShowTaskModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task name"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Assign To</label>
                  <select
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    disabled={loadingTeammates}
                  >
                    <option value="">{loadingTeammates ? 'Loading teammates...' : 'Select teammate'}</option>
                    {teammates.map((teammate) => (
                      <option key={teammate.id} value={teammate.id}>{teammate.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Describe this task"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>

              {taskActionError && (
                <p style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '14px' }}>{taskActionError}</p>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={taskActionLoading}>
                  {taskActionLoading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
