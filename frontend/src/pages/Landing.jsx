import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Layers, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Globe,
  MessageCircle,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  if (user) return <Navigate to="/" />;

  return (
    <div className="landing-page" style={{ background: 'var(--bg-dark)', minHeight: '100vh', color: '#fff' }}>
      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 60px',
        position: 'absolute',
        width: '100%',
        zIndex: 10
      }}>
        <h2 className="gradient-text" style={{ fontSize: '28px', fontWeight: '800' }}>TaskFlow</h2>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '160px 60px 100px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
      }}>
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)', 
          padding: '8px 20px', 
          borderRadius: '100px', 
          color: 'var(--primary)',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '24px',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          New: Interactive Kanban Board is here 🚀
        </div>
        <h1 style={{ fontSize: '72px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', maxWidth: '900px' }}>
          Manage your team projects with <span className="gradient-text">Absolute Clarity</span>
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
          The all-in-one task management tool designed for modern teams. 
          Collaborate, track, and ship projects faster with TaskFlow.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
            Start Building for Free <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </Link>
          <button className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '16px' }}>
            View Demo
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '100px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="grid-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          <div className="glass card" style={{ padding: '40px' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '24px' }}>
              <Zap size={32} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Blazing Fast</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Built with modern tech for instant interactions. No loading spinners, just pure productivity.
            </p>
          </div>
          <div className="glass card" style={{ padding: '40px' }}>
            <div style={{ color: 'var(--warning)', marginBottom: '24px' }}>
              <Layers size={32} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Kanban Excellence</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Visualize your workflow with our advanced drag-and-drop board. Move tasks seamlessly.
            </p>
          </div>
          <div className="glass card" style={{ padding: '40px' }}>
            <div style={{ color: 'var(--success)', marginBottom: '24px' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Role-Based Privacy</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Secure data isolation for every admin and member. Your data belongs to your team only.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 60px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <h2 className="gradient-text" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>TaskFlow</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
              The next generation of team management software.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '80px' }}>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                <li>Features</li>
                <li>Kanban</li>
                <li>Pricing</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
              <Globe size={20} />
              <MessageCircle size={20} />
              <Share2 size={20} />
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>
          © 2026 TaskFlow. Built for champions.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
