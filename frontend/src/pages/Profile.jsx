import { useState } from 'react';
import { User, Mail, Lock, Shield, Wallet, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { formatDate } from '../utils/formatters';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [passForm, setPassForm] = useState({ password: '', confirm: '' });
  const [nameSaving, setNameSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [nameMsg,  setNameMsg]  = useState('');
  const [passMsg,  setPassMsg]  = useState('');
  const [nameErr,  setNameErr]  = useState('');
  const [passErr,  setPassErr]  = useState('');

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U';

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) return setNameErr('Name cannot be empty');
    setNameSaving(true); setNameErr(''); setNameMsg('');
    try {
      const res = await authService.updateProfile({ name: nameForm.name });
      updateUser({ name: res.data.data.name });
      setNameMsg('✅ Name updated successfully!');
    } catch (err) { setNameErr(err.response?.data?.message || 'Failed to update'); }
    finally { setNameSaving(false); }
  };

  const handlePassSave = async (e) => {
    e.preventDefault();
    if (passForm.password !== passForm.confirm) return setPassErr('Passwords do not match');
    if (passForm.password.length < 6) return setPassErr('Password must be at least 6 characters');
    setPassSaving(true); setPassErr(''); setPassMsg('');
    try {
      await authService.updateProfile({ password: passForm.password });
      setPassMsg('✅ Password changed successfully!');
      setPassForm({ password: '', confirm: '' });
    } catch (err) { setPassErr(err.response?.data?.message || 'Failed to change password'); }
    finally { setPassSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="card p-5 mb-4">
      <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-4 pb-3"
        style={{ borderBottom: '1px solid #1a2e28' }}>
        <span className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
          <Icon size={14} style={{ color: '#10b981' }} />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );

  const Alert = ({ msg, isError }) => msg ? (
    <div className="mb-3 px-3.5 py-2.5 rounded-xl text-xs font-medium"
      style={{
        backgroundColor: isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
        color: isError ? '#ef4444' : '#10b981',
      }}>
      {msg}
    </div>
  ) : null;

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Profile Hero Card ── */}
      <div className="card p-6 mb-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'linear-gradient(135deg,#10b981 0%,transparent 60%)' }} />

        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: '#10b981' }}>
              <span className="text-white text-[8px] font-bold">✓</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white truncate">{user?.name}</h2>
            <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: '#4a7a73' }}>
              <Mail size={12} /> {user?.email}
            </p>
            <p className="text-xs mt-1" style={{ color: '#1e3d37' }}>
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>

          {/* Badge */}
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#10b981' }}>
            ✦ Active
          </span>
        </div>
      </div>

      {/* ── Edit Name ── */}
      <Section icon={User} title="Edit Display Name">
        <Alert msg={nameMsg} isError={false} />
        <Alert msg={nameErr} isError={true}  />
        <form onSubmit={handleNameSave} className="flex gap-3">
          <input type="text" value={nameForm.name}
            onChange={e => setNameForm({ name: e.target.value })}
            className="input-field flex-1" placeholder="Your full name" required />
          <button type="submit" disabled={nameSaving} className="btn-primary px-5 whitespace-nowrap text-sm">
            {nameSaving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </Section>

      {/* ── Change Password ── */}
      <Section icon={Lock} title="Change Password">
        <Alert msg={passMsg} isError={false} />
        <Alert msg={passErr} isError={true}  />
        <form onSubmit={handlePassSave} className="space-y-3">
          <input type="password" value={passForm.password}
            onChange={e => setPassForm({ ...passForm, password: e.target.value })}
            className="input-field" placeholder="New password (min. 6 characters)" required />
          <input type="password" value={passForm.confirm}
            onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
            className="input-field" placeholder="Confirm new password" required />
          <button type="submit" disabled={passSaving} className="btn-primary w-full text-sm">
            {passSaving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </Section>

      {/* ── Appearance ── */}
      <Section icon={Shield} title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">🌙 Dark Mode</p>
            <p className="text-xs mt-0.5" style={{ color: '#4a7a73' }}>WealthWise uses dark theme for best experience</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#10b981' }}>
            Active
          </span>
        </div>
      </Section>

      {/* ── App Info ── */}
      <Section icon={Wallet} title="About WealthWise">
        <div className="space-y-2.5 text-sm">
          {[
            ['Application',  'WealthWise v1.0.0'],
            ['Stack',        'MERN (MongoDB · Express · React · Node)'],
            ['Institution',  'GLA University, Mathura'],
            ['Course',       'B.Tech CSE — Mini Project 2026'],
            ['Team Lead',    'Ayush Agrawal (2415000394)'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-1.5 last:border-0"
              style={{ borderBottom: '1px solid #1a2e28' }}>
              <span className="text-xs" style={{ color: '#4a7a73' }}>{k}</span>
              <span className="font-semibold text-white text-xs text-right">{v}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Logout ── */}
      <div className="card p-4">
        <button onClick={handleLogout}
          className="w-full py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center gap-2"
          style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={15} /> Sign Out of WealthWise
        </button>
      </div>
    </div>
  );
}
