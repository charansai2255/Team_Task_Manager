import React, { useState, useEffect, useContext } from 'react';
import api from '../apiClient';
import { AuthContext } from '../context/AuthContext';
import { Plus, Briefcase, Users, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', memberEmails: '' });

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const emails = newProject.memberEmails.split(',').map(e => e.trim()).filter(e => e);
      await api.post('/projects', {
        name: newProject.name,
        description: newProject.description,
        memberEmails: emails
      });
      setShowModal(false);
      setNewProject({ name: '', description: '', memberEmails: '' });
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert('Error creating project');
    }
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '32px', marginBottom: '4px' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your team's project spaces and member access.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {projects.map(project => (
          <div
            key={project._id}
            className="glass"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/projects/${project._id}`)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/projects/${project._id}`); }}
            style={{ 
              cursor: 'pointer', 
              padding: '24px', 
              borderRadius: '20px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                <Briefcase size={24} />
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
            
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{project.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', minHeight: '42px' }}>
              {project.description || 'No description provided for this project.'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Owner
                </span>
                <span style={{ fontWeight: '500' }}>{project.owner?.name || 'You'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} /> Team Members
                </span>
                <span style={{ fontWeight: '600' }}>{project.memberCount || 0} members</span>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>No projects found. Create your first project to get started.</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(8px)'
        }}>
          <div className="glass card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input 
                  type="text" placeholder="e.g. Website Redesign" required
                  value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  placeholder="What is this project about?" rows="3"
                  value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Invite Members (emails, separated by commas)</label>
                <input 
                  type="text" placeholder="colleague@example.com, manager@example.com"
                  value={newProject.memberEmails} onChange={e => setNewProject({...newProject, memberEmails: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
