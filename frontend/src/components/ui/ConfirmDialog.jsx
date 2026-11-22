import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6"
        style={{ backgroundColor: '#0f1a16', border: '1px solid #1a2e28' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm mb-6" style={{ color: '#4a7a73' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 btn-secondary">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 btn-danger">
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
