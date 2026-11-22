import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6)       return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await authService.register({ name: form.name, email: form.email, password: form.password });
      login(res.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#060d0b' }}>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#0d2d20 0%,#0a1f18 50%,#060d0b 100%)', borderRight: '1px solid #1a2e28' }}
      >
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#10b981,transparent)' }} />
        <svg className="absolute bottom-0 left-0 right-0 w-full opacity-20" viewBox="0 0 400 180" fill="none">
          <path d="M0 180 L60 100 L120 140 L180 70 L240 110 L300 50 L360 90 L400 60 L400 180 Z" fill="#10b981" />
          <circle cx="300" cy="60" r="35" fill="#fbbf24" opacity="0.4" />
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-xl">
              <img src="/logo.png" alt="WealthWise" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">WealthWise</p>
              <p className="text-xs" style={{ color: '#4a9e95' }}>Personal Finance Tracker</p>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white leading-snug">
            Start your<br />
            <span style={{ color: '#10b981' }}>Financial Journey.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: '#4a9e95' }}>
            Create your free account and get instant access to powerful budgeting tools, goal tracking and smart insights.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {['✅ Free forever — no credit card needed', '🔒 Your data is encrypted & private', '📊 14 default categories ready to use'].map(f => (
            <div key={f} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.1)' }}>
              <span className="text-sm" style={{ color: '#4a9e95' }}>{f}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs" style={{ color: '#1e3d37' }}>
          GLA University, Mathura · MERN Stack Project · 2026
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow">
              <img src="/logo.png" alt="WealthWise" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white">WealthWise</span>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Create Account</h1>
          <p className="text-sm mb-7" style={{ color: '#4a7a73' }}>Join WealthWise and take control of your finances.</p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              <span className="flex-shrink-0">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a73' }} />
                <input name="name" type="text" value={form.name} onChange={handleChange}
                  className="input-field pl-10" placeholder="Ayush Agrawal" required />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a73' }} />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="input-field pl-10" placeholder="ayush@example.com" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a73' }} />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  className="input-field pl-10 pr-10" placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#4a7a73' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a73' }} />
                <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
                  className="input-field pl-10" placeholder="Re-enter password" required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 mt-1 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? '#1a4d3c' : 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#4a7a73' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#10b981' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
