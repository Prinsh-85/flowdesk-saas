import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Zap, Shield, Users } from 'lucide-react';
import './Auth.css';

const FEATURES = [
  { icon: Zap, title: 'Real-time Updates', desc: 'Kafka-powered live task sync across your team.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Invite members, assign roles, track activity.' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security with full audit logs.' },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Wrong username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* ── LEFT PANEL ─── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">⚡</div>
            <span className="auth-logo-text">FlowDesk</span>
          </div>

          <div className="auth-hero">
            <h1>Ship faster,<br />together.</h1>
            <p>The modern project management platform built for engineering teams moving at speed.</p>
          </div>

          <div className="auth-features">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div className="auth-feature-item" key={title}>
                <div className="auth-feature-icon"><Icon size={18} /></div>
                <div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-testimonial">
            <CheckCircle2 size={16} />
            <span>Trusted by 500+ engineering teams worldwide</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Log in to your workspace to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="login-password">Password</label>
                <a href="#" className="auth-forgot" tabIndex={-1}>Forgot password?</a>
              </div>
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>Log In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?&nbsp;
            <Link to="/signup">Create one free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
