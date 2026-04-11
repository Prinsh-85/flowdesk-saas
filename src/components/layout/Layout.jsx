import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, CheckCircle, LogOut, User } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { notifications, setNotifications } = useSocket();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <div className="layout-root">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="main-content">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="topbar-right">
            {/* Notification Bell */}
            <div className="topbar-dropdown" ref={notifRef}>
              <button
                className={`icon-btn notif-btn ${notifications.length > 0 ? 'has-notif' : ''}`}
                onClick={() => setNotifOpen(v => !v)}
                title="Notifications"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="notif-badge">{notifications.length > 9 ? '9+' : notifications.length}</span>
                )}
              </button>

              {notifOpen && (
                <div className="dropdown-panel notif-panel">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <button className="clear-btn" onClick={clearNotifications}>Clear all</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="dropdown-empty">
                      <CheckCircle size={32} />
                      <p>All caught up!</p>
                    </div>
                  ) : (
                    <ul className="notif-list">
                      {notifications.map((n, i) => (
                        <li key={i} className="notif-item">
                          <div className="notif-dot" />
                          <div>
                            <p className="notif-msg">{n.message}</p>
                            <span className="notif-time">Just now</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="topbar-dropdown" ref={userRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setUserMenuOpen(v => !v)}
                title={user?.name}
              >
                <span className="avatar-circle">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </button>

              {userMenuOpen && (
                <div className="dropdown-panel user-panel">
                  <div className="user-panel-header">
                    <div className="avatar-circle avatar-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setShowProfile(true); setUserMenuOpen(false); }}>
                    <User size={15} /> Profile
                  </button>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>My Profile</h2>
              <button className="close-btn" onClick={() => setShowProfile(false)}><X size={24} /></button>
            </div>
            <div className="modal-body profile-body">
              <div className="profile-header-large">
                <div className="avatar-circle avatar-xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="profile-name-large">{user?.name}</h3>
                  <p className="profile-role-badge">{user?.role || 'Member'}</p>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="detail-item">
                  <label>Email Address</label>
                  <p>{user?.email}</p>
                </div>
                <div className="detail-item">
                  <label>Account ID</label>
                  <p>#{user?.id}</p>
                </div>
                <div className="detail-item">
                  <label>Timezone</label>
                  <p>UTC (Default)</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                <button className="btn-secondary" onClick={() => setShowProfile(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <button className="mobile-close"><X size={24} /></button>
        </div>
      )}
    </div>
  );
}
