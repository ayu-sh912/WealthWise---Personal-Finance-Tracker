import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} rounded-2xl shadow-2xl`}
        style={{ backgroundColor: '#0f1a16', border: '1px solid #1a2e28' }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #1a2e28' }}>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: '#4a7a73' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a2e28'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4a7a73'; }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
