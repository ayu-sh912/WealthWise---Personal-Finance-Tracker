import { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { categoryService } from '../services/categoryService';

const COLORS = ['#10b981','#6366f1','#8b5cf6','#f59e0b','#06b6d4','#f97316','#3b82f6','#ec4899','#ef4444','#6b7280'];
const EMPTY_FORM = { name: '', type: 'expense', color: '#6366f1', icon: 'tag' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try { const res = await categoryService.getAll(); setCategories(res.data.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ open: true, editing: null }); setError(''); };
  const openEdit = (cat) => { setForm({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon }); setModal({ open: true, editing: cat._id }); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (modal.editing) await categoryService.update(modal.editing, form);
      else await categoryService.create(form);
      setModal({ open: false, editing: null });
      fetchCategories();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save category'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await categoryService.remove(confirm.id); setConfirm({ open: false, id: null }); fetchCategories(); }
    catch (err) { console.error(err); } finally { setDeleting(false); }
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const bothCategories = categories.filter((c) => c.type === 'both');

  const CategoryGrid = ({ cats, title }) => (
    <div>
      <h3 className="font-semibold text-xs uppercase tracking-wide mb-3" style={{ color: '#4a9e95' }}>{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {cats.map((cat) => (
          <div key={cat._id} className="card p-3.5 flex flex-col items-center gap-2 group relative"
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2a4d40'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2e28'}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
              <span className="text-lg" style={{ color: cat.color }}>●</span>
            </div>
            <span className="text-xs font-medium text-white text-center leading-tight">{cat.name}</span>
            {cat.isDefault && (
              <span className="text-xs" style={{ color: '#1e3d37' }}></span>
            )}
            {!cat.isDefault && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1 rounded-lg transition-colors"
                  style={{ color: '#4a7a73' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a2e28'; e.currentTarget.style.color = '#10b981'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4a7a73'; }}>
                  <Edit2 size={12} />
                </button>
                <button onClick={() => setConfirm({ open: true, id: cat._id })} className="p-1 rounded-lg transition-colors"
                  style={{ color: '#4a7a73' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4a7a73'; }}>
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="md" text="Loading categories..." /></div>
      ) : (
        <div className="space-y-8">
          {incomeCategories.length > 0 && <CategoryGrid cats={incomeCategories} title="Income Categories" />}
          {expenseCategories.length > 0 && <CategoryGrid cats={expenseCategories} title="Expense Categories" />}
          {bothCategories.length > 0 && <CategoryGrid cats={bothCategories} title="General Categories" />}
          {categories.length === 0 && (
            <EmptyState icon={Tag} title="No categories" subtitle="Add categories to organize your transactions"
              action={<button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2 mx-auto"><Plus size={14} />Add Category</button>} />
          )}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>}
          <div>
            <label className="label">Category Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g., Groceries" required />
          </div>
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['income', 'expense', 'both'].map((t) => (
                <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                  className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.type === t ? 'border-emerald-500 text-emerald-400' : 'border-gray-700 text-gray-500'}`}
                  style={{ backgroundColor: form.type === t ? 'rgba(16,185,129,0.1)' : '#0a1510' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
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
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : modal.editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete} loading={deleting}
        title="Delete Category" message="This custom category will be permanently deleted." />
    </div>
  );
}
