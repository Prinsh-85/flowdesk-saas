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

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
            <h1>Start shipping<br />in minutes.</h1>
            <p>Set up your workspace, invite your team, and start managing projects — all in one place.</p>
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
            <span>Free to get started. No credit card required.</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Join thousands of teams using FlowDesk</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoComplete="name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Work Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password <span className="auth-hint">(min. 6 characters)</span></label>
              <div className="auth-password-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
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
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>

            <p className="auth-terms">
              By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <div className="auth-switch">
            Already have an account?&nbsp;
            <Link to="/login">Log in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
