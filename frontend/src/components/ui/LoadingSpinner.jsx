export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} rounded-full animate-spin`}
        style={{ border: '2px solid #1a2e28', borderTopColor: '#10b981' }} />
      {text && <p className="text-sm" style={{ color: '#4a7a73' }}>{text}</p>}
    </div>
  );
}
