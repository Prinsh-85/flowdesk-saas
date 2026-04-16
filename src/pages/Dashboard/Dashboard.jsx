import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { getAllProjects, createProject, deleteProject } from '../../api/projectService';
import {
  LayoutDashboard, CheckCircle2, Clock, Zap, FolderKanban,
  Plus, X, ArrowRight, AlertCircle, TrendingUp, Trash2
} from 'lucide-react';
import './Dashboard.css';

export function Dashboard() {
  const { tasks, loading } = useTasks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [projError, setProjError] = useState('');

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project and all its tasks?")) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  useEffect(() => {
    getAllProjects()
      .then(r => setProjects(r.data))
      .catch(() => {}); // Projects may not be set up yet
  }, []);

  const todo = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;

  const stats = [
    { label: 'Total Tasks', value: total, icon: LayoutDashboard, color: 'purple' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'blue' },
    { label: 'Completed', value: done, icon: CheckCircle2, color: 'green' },
    { label: 'To Do', value: todo, icon: AlertCircle, color: 'orange' },
  ];

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setCreating(true);
    setProjError('');
    try {
      const res = await createProject(newProject);
      setProjects(prev => [res.data, ...prev]);
      setNewProject({ name: '', description: '' });
      setShowCreate(false);
    } catch (err) {
      setProjError(err?.response?.data?.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="dashboard animate-fade-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening in your workspace today.</p>
        </div>
        <button className="dash-cta" onClick={() => projects.length > 0 ? navigate(`/board/${projects[0].id}`) : setShowCreate(true)}>
          <Zap size={16} /> Open Board
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div className={`stat-card stat-${color}`} key={label}>
            <div className="stat-top">
              <span className="stat-label">{label}</span>
              <div className="stat-icon-wrap"><Icon size={18} /></div>
            </div>
            <div className="stat-value">{loading ? '–' : value}</div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: total > 0 ? `${(value / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Projects Panel */}
        <div className="dash-panel">
          <div className="panel-header">
            <div className="panel-title">
              <FolderKanban size={18} />
              <h2>Projects</h2>
              <span className="badge">{projects.length}</span>
            </div>
            <button className="icon-action-btn" onClick={() => setShowCreate(true)} title="New Project">
              <Plus size={16} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="panel-empty">
              <FolderKanban size={36} />
              <p>No projects yet</p>
              <button className="create-first-btn" onClick={() => setShowCreate(true)}>
                <Plus size={14} /> Create first project
              </button>
            </div>
          ) : (
            <ul className="project-list">
              {projects.map(p => (
                <li key={p.id} className="project-item" onClick={() => navigate(`/board/${p.id}`)}>
                  <div className="project-color-dot" />
                  <div className="project-info">
                    <strong>{p.name}</strong>
                    {p.description && <span>{p.description}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="icon-action-btn" onClick={(e) => handleDeleteProject(e, p.id)} title="Delete">
                      <Trash2 size={14} color="#f43f5e" />
                    </button>
                    <ArrowRight size={14} className="project-arrow" style={{ position: 'static' }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Tasks Panel */}
        <div className="dash-panel">
          <div className="panel-header">
            <div className="panel-title">
              <TrendingUp size={18} />
              <h2>Recent Tasks</h2>
            </div>
            <Link to="/board" className="panel-link">View all →</Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="panel-empty">
              <CheckCircle2 size={36} />
              <p>No tasks yet — create one on the board!</p>
            </div>
          ) : (
            <ul className="recent-task-list">
              {recentTasks.map(t => (
                <li key={t.id} className="recent-task-item" onClick={() => t.project ? navigate(`/board/${t.project.id}`) : null}>
                  <span className={`status-dot dot-${t.status}`} />
                  <span className="task-title-text">{t.title}</span>
                  <span className={`priority-chip chip-${t.priority}`}>{t.priority}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Project</h2>
              <button className="close-btn" onClick={() => setShowCreate(false)}><X size={22} /></button>
            </div>
            <form className="modal-body" onSubmit={handleCreateProject}>
              {projError && <div className="auth-error">⚠️ {projError}</div>}
              <div className="auth-field">
                <label>Project Name</label>
                <input
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Mobile App Redesign"
                  required
                  autoFocus
                />
              </div>
              <div className="auth-field">
                <label>Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What's this project about?"
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="auth-submit-btn" style={{ width: 'auto', padding: '0.65rem 1.25rem' }} disabled={creating}>
                  {creating ? <span className="auth-spinner" /> : <><Plus size={15} /> Create Project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
