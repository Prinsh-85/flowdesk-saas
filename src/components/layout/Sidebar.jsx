import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, KanbanSquare, FolderKanban,
  Bell, Settings, LogOut, X, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import './Sidebar.css';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} />, end: true },
    { name: 'Projects', path: '/', icon: <KanbanSquare size={18} /> },
  ];

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon"><Zap size={16} /></div>
            <h2>FlowDesk</h2>
          </div>
          {mobileOpen && (
            <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Member'}</span>
          </div>
          <div className={`ws-dot ${connected ? 'ws-online' : 'ws-offline'}`} title={connected ? 'Live' : 'Offline'} />
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">WORKSPACE</p>
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-footer-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
