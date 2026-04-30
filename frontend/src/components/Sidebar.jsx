import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import api from '../apiClient';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  LogOut,
  User as UserIcon,
  Plus,
  FolderDot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projects', icon: Briefcase, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  ];

  return (
    <aside className="sidebar glass" style={{
      width: '260px',
      height: 'calc(100vh - 24px)',
      position: 'fixed',
      left: '12px',
      top: '12px',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 16px',
      zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <div className="sidebar-header" style={{ marginBottom: '40px', padding: '0 10px' }}>
        <h2 className="gradient-text" style={{ fontSize: '24px', fontWeight: '800' }}>TaskFlow</h2>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 16px', marginBottom: '12px' }}>Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '4px',
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              })}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
        <div className="user-profile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px',
          marginBottom: '20px'
        }}>
          <div className="avatar" style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="btn btn-secondary" 
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
