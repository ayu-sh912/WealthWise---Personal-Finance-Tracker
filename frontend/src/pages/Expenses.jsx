import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingDown } from 'lucide-react';
import TransactionItem from '../components/ui/TransactionItem';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { formatCurrency } from '../utils/formatters';

const EMPTY_FORM = { type: 'expense', amount: '', category: '', date: new Date().toISOString().split('T')[0], description: '', notes: '' };

export default function Expenses() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [totalExpense, setTotalExpense] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionService.getAll({ type: 'expense', page, limit: 10 });
      const txs = res.data.data.transactions;
      setTransactions(txs);
      setPagination(res.data.data.pagination);
      setTotalExpense(txs.reduce((s, t) => s + t.amount, 0));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { categoryService.getAll({ type: 'expense' }).then((r) => setCategories(r.data.data)).catch(() => {}); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ open: true, editing: null }); setError(''); };
  const openEdit = (tx) => { setForm({ type: 'expense', amount: tx.amount, category: tx.category, date: tx.date?.split('T')[0] || '', description: tx.description || '', notes: tx.notes || '' }); setModal({ open: true, editing: tx._id }); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const catObj = categories.find((c) => c.name === form.category);
      const payload = { ...form, type: 'expense', categoryColor: catObj?.color };
      if (modal.editing) await transactionService.update(modal.editing, payload);
      else await transactionService.create(payload);
      setModal({ open: false, editing: null });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await transactionService.remove(confirm.id); setConfirm({ open: false, id: null }); fetchData(); }
    catch (err) { console.error(err); } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="card px-4 py-3 inline-flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}><TrendingDown size={18} style={{ color: '#ef4444' }} /></div>
          <div>
            <p className="text-xs" style={{ color: '#4a7a73' }}>Total Expenses (this page)</p>
            <p className="font-bold text-lg" style={{ color: '#ef4444' }}>{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="md" text="Loading expenses..." /></div>
        ) : transactions.length > 0 ? (
          <>
            <div>
              {transactions.map((tx) => (
                <TransactionItem key={tx._id} transaction={tx} onEdit={openEdit} onDelete={(id) => setConfirm({ open: true, id })} />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4" style={{ borderTop: '1px solid #1a2e28' }}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                <span className="text-xs" style={{ color: '#4a7a73' }}>Page {page} of {pagination.pages}</span>
                <button disabled={page === pagination.pages} onClick={() => setPage(page + 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon={TrendingDown} title="No expenses recorded" subtitle="Track your food, transport, bills and more"
            action={<button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2 mx-auto"><Plus size={14} />Add Expense</button>} />
        )}
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>}
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="0.00" required />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" required>
              <option value="">Select expense category</option>
              {categories.filter((c) => c.type === 'expense' || c.type === 'both').map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="e.g., Grocery shopping" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal({ open: false, editing: null })} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : modal.editing ? 'Update' : 'Add Expense'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete} loading={deleting}
        title="Delete Expense" message="This expense will be permanently deleted." />
    </div>
  );
}
