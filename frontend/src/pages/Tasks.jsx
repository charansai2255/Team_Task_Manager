import React, { useState, useEffect, useContext } from 'react';
import api from '../apiClient';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, Calendar, User, ChevronRight, X, Loader2 } from 'lucide-react';

const COLUMNS = [
  { id: 'Todo', title: 'To Do', color: 'var(--text-muted)' },
  { id: 'In Progress', title: 'In Progress', color: 'var(--warning)' },
  { id: 'Done', title: 'Done', color: 'var(--success)' },
];

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      alert(`Error: ${msg} at line ${lineNo}`);
      return false;
    };
  }, []);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [loadingTeammates, setLoadingTeammates] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', project: '', assignee: '', description: '', priority: 'Medium', dueDate: '' });
  const manageableProjects = projects.filter((project) => project.canCreateTasks);

  const loadData = async () => {
    try {
      const [t, p] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects')
      ]);
      console.log("Tasks loaded:", t.data);
      console.log("Projects loaded:", p.data);
      setTasks(Array.isArray(t.data) ? t.data : []);
      setProjects(Array.isArray(p.data) ? p.data : []);
    } catch (err) { 
      console.error('Data Load Error:', err); 
      // If unauthorized, user might have been logged out
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
      }
    }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  // Dynamic Teammate Loading
  useEffect(() => {
    const fetchTeammates = async () => {
      if (!form.project) {
        console.log('Teammate fetch skipped: no project selected');
        setTeammates([]);
        return;
      }
      if (!user) {
        console.log('Teammate fetch skipped: session not ready yet', { projectId: form.project });
        setTeammates([]);
        return;
      }

      console.log('Fetching teammates for project:', {
        projectId: form.project,
        sessionReady: Boolean(user)
      });
      setLoadingTeammates(true);
      try {
        const response = await api.get(`/projects/${form.project}/teammates`);
        console.log('Teammates response:', {
          status: response.status,
          projectId: form.project,
          data: response.data
        });

        const teammateList = Array.isArray(response.data) ? response.data : [];
        console.log('Parsed teammates list:', teammateList, 'count:', teammateList.length);
        setTeammates(teammateList);
      } catch (err) {
        console.error('Teammate Load Error:', {
          projectId: form.project,
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        setTeammates([]);
      } finally {
        setLoadingTeammates(false);
      }
    };
    fetchTeammates();
  }, [form.project, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      setShowModal(false);
      setForm({ title: '', project: '', assignee: '', description: '', priority: 'Medium', dueDate: '' });
      loadData();
    } catch (err) { alert('Error creating task'); }
  };

  const updateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Todo' ? 'In Progress' : 'Done';
    try {
      await api.put(`/tasks/${id}`, { status: nextStatus });
      loadData();
    } catch (err) { console.error(err); }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    try {
      await api.put(`/tasks/${result.draggableId}`, { status: result.destination.droppableId });
      loadData();
    } catch (err) { console.error(err); }
  };

  const removeTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        loadData();
      } catch (err) { console.error(err); }
    }
  };

  if (!user) return null;

  return (
    <div className="tasks-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '32px' }}>Tasks</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage the tasks you can access across your projects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18}/> New Task
        </button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map(col => (
            <div key={col.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title">{col.title} <span className="count-badge">{tasks.filter(t => t.status === col.id).length}</span></div>
              </div>
              <Droppable droppableId={col.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '200px' }}>
                    {tasks.filter(t => t.status === col.id).map((t, index) => (
                      <Draggable key={t._id} draggableId={t._id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps} 
                            className="glass card task-card"
                            style={{ 
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              borderLeft: `4px solid ${col.id === 'Todo' ? '#94a3b8' : col.id === 'In Progress' ? 'var(--warning)' : 'var(--success)'}`
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span className={`task-priority priority-${t.priority?.toLowerCase()}`}>{t.priority}</span>
                              {t.canDelete && <Trash2 size={14} color="var(--danger)" onClick={() => removeTask(t._id)} style={{cursor:'pointer'}}/>}
                            </div>
                            <h4 style={{ margin: '8px 0', fontSize: '15px' }}>{t.title}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{t.description}</p>
                            <div className="task-footer">
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><Calendar size={13} /> {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '500' }}>{t.assignee?.name || 'Unassigned'}</span>
                                <div className="user-avatar">{t.assignee?.name?.charAt(0) || <User size={12}/>}</div>
                              </div>
                            </div>
                            {t.canUpdate && col.id !== 'Done' && (
                              <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px', padding: '10px' }} onClick={() => updateStatus(t._id, col.id)}>
                                <ChevronRight size={14} /> Mark {col.id === 'Todo' ? 'In Progress' : 'Done'}
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">Create New Task</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowModal(false)} />
            </div>
            {!manageableProjects.length && (
              <div className="glass" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px' }}>No accessible projects.</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Create projects first, then you can add tasks inside them.</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    navigate('/projects');
                  }}
                >
                  Create Project
                </button>
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  className="premium-input" type="text" required placeholder="Enter task name..."
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Project</label>
                  <select 
                    className="premium-input premium-select" required 
                    value={form.project} onChange={e => {
                      const selectedProjectId = e.target.value;
                      console.log('Project selected in task dialog:', {
                        selectedProjectId,
                        previousProjectId: form.project
                      });
                      setTeammates([]);
                      setForm({ ...form, project: selectedProjectId, assignee: '' });
                    }}
                  >
                    <option value="" disabled>{manageableProjects.length ? 'Select Project' : 'No admin projects available'}</option>
                    {manageableProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label>Assign To</label>
                  <select 
                    className="premium-input premium-select" 
                    value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})}
                    disabled={!form.project || loadingTeammates}
                  >
                    <option value="">{loadingTeammates ? 'Loading teammates...' : 'Select Teammate'}</option>
                    {teammates.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea 
                  className="premium-input" rows="3" placeholder="Describe the task details..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Priority</label>
                  <select 
                    className="premium-input premium-select"
                    value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Due Date</label>
                  <input 
                    className="premium-input" type="date"
                    value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
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
                      setShowModal(false);
                      navigate('/projects');
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

export default Tasks;
