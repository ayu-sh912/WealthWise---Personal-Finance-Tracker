import { Link } from 'react-router-dom';
import { Wallet, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-6">
          <Wallet size={40} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Page Not Found</h2>
        <p className="text-gray-400 dark:text-gray-500 mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <Home size={16} /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
