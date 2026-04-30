import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../apiClient';
import { AuthContext } from '../context/AuthContext';
import { 
  CheckCircle2, Clock, AlertTriangle, LayoutGrid, 
  Plus, ArrowRight, TrendingUp, Briefcase, Zap,
  CircleDot, CheckSquare, Calendar, X, Loader2
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="glass" style={{
    padding: '20px 24px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: '1',
    minWidth: '160px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [teammates, setTeammates] = useState([]);
  const [loadingTeammates, setLoadingTeammates] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', memberEmails: '' });
  const [newTask, setNewTask] = useState({
    title: '',
    project: '',
    assignee: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Todo'
  });
  const manageableProjects = projects.filter((project) => project.canCreateTasks);

  const loadData = async () => {
    try {
      const [t, p] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(Array.isArray(t.data) ? t.data : []);
      setProjects(Array.isArray(p.data) ? p.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    const fetchTeammates = async () => {
      if (!showTaskModal || !newTask.project) {
        setTeammates([]);
        return;
      }

      try {
        setLoadingTeammates(true);
        const { data } = await api.get(`/projects/${newTask.project}/teammates`);
        setTeammates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Dashboard teammate fetch error:', err);
        setTeammates([]);
      } finally {
        setLoadingTeammates(false);
      }
    };

    fetchTeammates();
  }, [showTaskModal, newTask.project]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const emails = newProject.memberEmails.split(',').map((value) => value.trim()).filter((value) => value);
      await api.post('/projects', {
        name: newProject.name,
        description: newProject.description,
        memberEmails: emails
      });

      setShowProjectModal(false);
      setNewProject({ name: '', description: '', memberEmails: '' });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...newTask,
        assignee: newTask.assignee || null,
      });

      setShowTaskModal(false);
      setTeammates([]);
      setNewTask({
        title: '',
        project: '',
        assignee: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        status: 'Todo'
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Done').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.5px' }}>OVERVIEW</p>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ gap: '8px', padding: '10px 20px' }} onClick={() => setShowProjectModal(true)}>
            <Briefcase size={16} /> New Project
          </button>
          <button className="btn btn-primary" style={{ gap: '8px', padding: '10px 20px' }} onClick={() => setShowTaskModal(true)}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard icon={LayoutGrid} label="Total Tasks" value={stats.total} color="var(--primary)" bg="rgba(99,102,241,0.15)" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="var(--success)" bg="rgba(16,185,129,0.15)" />
        <StatCard icon={CircleDot} label="In Progress" value={stats.inProgress} color="var(--warning)" bg="rgba(245,158,11,0.15)" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="var(--danger)" bg="rgba(239,68,68,0.15)" />
      </div>

      {/* Progress + Recent Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
        {/* Completion Rate */}
        <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <TrendingUp size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Completion Rate</h3>
          </div>
          <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 20px' }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="8"
                strokeDasharray={`${completionRate * 2.51} 251`}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '26px', fontWeight: '800' }}>{completionRate}%</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Done</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            {stats.completed} of {stats.total} tasks completed
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} color="var(--warning)" />
              <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Recent Tasks</h3>
            </div>
            <Link to="/tasks" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div>
            {tasks.slice(0, 5).map(t => (
              <div key={t._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {t.status === 'Done' 
                    ? <CheckSquare size={16} color="var(--success)" />
                    : t.status === 'In Progress' 
                      ? <CircleDot size={16} color="var(--warning)" />
                      : <CircleDot size={16} color="var(--text-muted)" />
                  }
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: t.status === 'Done' ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>{t.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.project?.name || 'No Project'}</p>
                  </div>
                </div>
                <span className={`task-priority priority-${t.priority?.toLowerCase()}`}>{t.priority}</span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>No tasks yet. Create one to get started!</p>
            )}
          </div>
        </div>
      </div>

      {/* Projects Strip */}
      <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={18} color="var(--secondary)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Active Projects</h3>
          </div>
          <Link to="/projects" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
            Manage <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {projects.slice(0, 4).map(p => (
            <div key={p._id} className="glass" style={{ padding: '16px 20px', borderRadius: '14px', minWidth: '160px', flex: '1' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', marginBottom: '12px' }} />
              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{p.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {tasks.filter(t => t.project?.name === p.name).length} tasks
              </p>
            </div>
          ))}
          {projects.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No projects yet.</p>
          )}
        </div>
      </div>

      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">Create New Project</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowProjectModal(false)} />
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Invite Members (emails, separated by commas)</label>
                <input
                  type="text"
                  placeholder="colleague@example.com, manager@example.com"
                  value={newProject.memberEmails}
                  onChange={(e) => setNewProject({ ...newProject, memberEmails: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">Create New Task</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowTaskModal(false)} />
            </div>

            {!manageableProjects.length && (
              <div className="glass" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px' }}>No accessible projects.</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Create projects first, then you can add tasks inside them.</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTaskModal(false);
                    setShowProjectModal(true);
                  }}
                >
                  Create Project
                </button>
              </div>
            )}

            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Enter task name..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Project</label>
                  <select
                    required
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value, assignee: '' })}
                  >
                    <option value="" disabled>{manageableProjects.length ? 'Select Project' : 'No admin projects available'}</option>
                    {manageableProjects.map((project) => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Assign To</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    disabled={!newTask.project || loadingTeammates}
                  >
                    <option value="">{loadingTeammates ? 'Loading teammates...' : 'Select Teammate'}</option>
                    {teammates.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Describe the task details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>Cancel</button>
                {manageableProjects.length ? (
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {loadingTeammates ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Create Task
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      setShowTaskModal(false);
                      setShowProjectModal(true);
                    }}
                  >
                    Create Project
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
