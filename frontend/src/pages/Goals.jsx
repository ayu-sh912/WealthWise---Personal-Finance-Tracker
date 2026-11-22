import { useState, useEffect } from 'react';
import { Plus, Target } from 'lucide-react';
import GoalCard from '../components/ui/GoalCard';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { goalService } from '../services/goalService';

const COLORS = ['#f59e0b','#6366f1','#10b981','#ec4899','#3b82f6','#8b5cf6','#f97316','#06b6d4'];
const EMPTY_FORM = { name: '', targetAmount: '', currentAmount: '', deadline: '', description: '', color: '#f59e0b' };
const CONTRIB_FORM = { amount: '', note: '' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [contribModal, setContribModal] = useState({ open: false, goal: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [contrib, setContrib] = useState(CONTRIB_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    setLoading(true);
    try { const res = await goalService.getAll(); setGoals(res.data.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ open: true, editing: null }); setError(''); };
  const openEdit = (goal) => {
    setForm({ name: goal.name, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount, deadline: goal.deadline?.split('T')[0] || '', description: goal.description || '', color: goal.color });
    setModal({ open: true, editing: goal._id }); setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (modal.editing) await goalService.update(modal.editing, form);
      else await goalService.create(form);
      setModal({ open: false, editing: null }); fetchGoals();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save goal'); }
    finally { setSaving(false); }
  };

  const handleContribute = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await goalService.contribute(contribModal.goal._id, contrib);
      setContribModal({ open: false, goal: null }); setContrib(CONTRIB_FORM); fetchGoals();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add contribution'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await goalService.remove(confirm.id); setConfirm({ open: false, id: null }); fetchGoals(); }
    catch (err) { console.error(err); } finally { setDeleting(false); }
  };

  const active    = goals.filter((g) => g.status === 'active');
  const completed = goals.filter((g) => g.status === 'completed');
  const paused    = goals.filter((g) => g.status === 'paused');

  const SectionHeader = ({ label }) => (
    <h3 className="font-semibold text-xs uppercase tracking-wide mb-4" style={{ color: '#4a9e95' }}>{label}</h3>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="md" text="Loading goals..." /></div>
      ) : goals.length === 0 ? (
        <EmptyState icon={Target} title="No savings goals yet"
          subtitle="Create goals like Emergency Fund, Vacation, New Phone and track your progress"
          action={<button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2 mx-auto"><Plus size={14} />Create Goal</button>} />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <SectionHeader label={`Active Goals (${active.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map((goal) => (
                  <GoalCard key={goal._id} goal={goal}
                    onContribute={(g) => { setContribModal({ open: true, goal: g }); setContrib(CONTRIB_FORM); setError(''); }}
                    onEdit={openEdit}
                    onDelete={(id) => setConfirm({ open: true, id })} />
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <SectionHeader label={`Completed Goals (${completed.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {completed.map((goal) => (
                  <GoalCard key={goal._id} goal={goal} onEdit={openEdit} onDelete={(id) => setConfirm({ open: true, id })} />
                ))}
              </div>
            </div>
          )}
          {paused.length > 0 && (
            <div>
              <SectionHeader label={`Paused Goals (${paused.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paused.map((goal) => (
                  <GoalCard key={goal._id} goal={goal}
                    onContribute={(g) => { setContribModal({ open: true, goal: g }); setContrib(CONTRIB_FORM); setError(''); }}
                    onEdit={openEdit}
                    onDelete={(id) => setConfirm({ open: true, id })} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Goal' : 'Create New Goal'}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>}
          <div>
            <label className="label">Goal Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field" placeholder="e.g., Emergency Fund, Vacation, New Laptop" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Amount (₹)</label>
              <input type="number" min="1" step="0.01" value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                className="input-field" placeholder="50000" required />
            </div>
            <div>
              <label className="label">Already Saved (₹)</label>
              <input type="number" min="0" step="0.01" value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                className="input-field" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="label">Target Deadline (optional)</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none" rows={2} placeholder="What is this goal for?" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-500' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal({ open: false, editing: null })} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Saving...' : modal.editing ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal isOpen={contribModal.open} onClose={() => setContribModal({ open: false, goal: null })} title={`Add Money — ${contribModal.goal?.name}`} size="sm">
        <form onSubmit={handleContribute} className="space-y-4">
          {error && <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>}
          {contribModal.goal && (
            <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#0a1510', border: '1px solid #1a2e28' }}>
              <div className="flex justify-between" style={{ color: '#4a7a73' }}>
                <span>Saved so far:</span>
                <span className="font-medium text-white">₹{contribModal.goal.currentAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between mt-1" style={{ color: '#4a7a73' }}>
                <span>Target:</span>
                <span className="font-medium text-white">₹{contribModal.goal.targetAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
          <div>
            <label className="label">Contribution Amount (₹)</label>
            <input type="number" min="1" step="0.01" value={contrib.amount}
              onChange={(e) => setContrib({ ...contrib, amount: e.target.value })}
              className="input-field" placeholder="1000" required />
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <input type="text" value={contrib.note} onChange={(e) => setContrib({ ...contrib, note: e.target.value })}
              className="input-field" placeholder="e.g., Monthly contribution" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setContribModal({ open: false, goal: null })} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Adding...' : 'Add Money'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete} loading={deleting}
        title="Delete Goal" message="This savings goal and all its contribution history will be permanently deleted." />
    </div>
  );
}
