import { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeftRight, Search, Filter } from 'lucide-react';
import TransactionItem from '../components/ui/TransactionItem';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { formatCurrency } from '../utils/formatters';

const EMPTY_FORM = { type: 'expense', amount: '', category: '', date: new Date().toISOString().split('T')[0], description: '', notes: '' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ type: '', category: '', page: 1 });
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      const res = await transactionService.getAll(params);
      setTransactions(res.data.data.transactions);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ open: true, editing: null }); setError(''); };
  const openEdit = (tx) => {
    setForm({ type: tx.type, amount: tx.amount, category: tx.category, date: tx.date?.split('T')[0] || '', description: tx.description || '', notes: tx.notes || '' });
    setModal({ open: true, editing: tx._id });
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return setError('Amount and category are required');
    setSaving(true); setError('');
    try {
      const catObj = categories.find((c) => c.name === form.category);
      const payload = { ...form, categoryColor: catObj?.color || '#6366f1' };
      if (modal.editing) await transactionService.update(modal.editing, payload);
      else await transactionService.create(payload);
      setModal({ open: false, editing: null });
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await transactionService.remove(confirm.id);
      setConfirm({ open: false, id: null });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.type === form.type || c.type === 'both'
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm" style={{ color: '#4a7a73' }}>{pagination.total} total transactions</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-gray-400" />
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
          className="input-field w-auto text-sm">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          className="input-field w-auto text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <button onClick={() => setFilters({ type: '', category: '', page: 1 })}
          className="btn-secondary text-xs px-3 py-2">Reset</button>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="md" text="Loading transactions..." /></div>
        ) : transactions.length > 0 ? (
          <>
            <div style={{ borderTop: 'none' }}>
              {transactions.map((tx) => (
                <TransactionItem key={tx._id} transaction={tx}
                  onEdit={openEdit} onDelete={(id) => setConfirm({ open: true, id })} />
              ))}
            </div>
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4" style={{ borderTop: '1px solid #1a2e28' }}>
                <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                <span className="text-xs" style={{ color: '#4a7a73' }}>Page {pagination.page} of {pagination.pages}</span>
                <button disabled={filters.page === pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon={ArrowLeftRight} title="No transactions found"
            subtitle="Add your first income or expense transaction"
            action={<button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2 mx-auto"><Plus size={14} />Add Transaction</button>} />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>}

          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['income', 'expense'].map((t) => (
                <button key={t} type="button" onClick={() => setForm({ ...form, type: t, category: '' })}
                  className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.type === t
                    ? t === 'income' ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400'
                    : 'border-gray-700 text-gray-500'}`}
                  style={{ backgroundColor: form.type === t ? (t === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : '#0a1510' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" step="0.01" min="0.01" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field" placeholder="0.00" required />
          </div>

          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field" required>
              <option value="">Select category</option>
              {filteredCategories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field" required />
          </div>

          <div>
            <label className="label">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field" placeholder="Brief description (optional)" />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none" rows={2} placeholder="Additional notes (optional)" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal({ open: false, editing: null })} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Saving...' : modal.editing ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Transaction" message="This transaction will be permanently deleted. This action cannot be undone." />
    </div>
  );
}
