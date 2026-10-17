import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-indigo-500 animate-pulse" />
          </div>
          <Loader2 className="w-20 h-20 text-indigo-500/30 animate-spin absolute -inset-2" />
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          Verifying sentinel credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    const pageName =
      location.pathname.includes('collections')
        ? 'Collections'
        : location.pathname.includes('history')
        ? 'History'
        : location.pathname.includes('settings')
        ? 'Settings'
        : 'Protected Workspace';

    return (
      <Navigate
        to="/"
        replace
        state={{
          accessRestricted: true,
          pageName,
          from: location,
        }}
      />
    );
  }

  return children ? children : <Outlet />;
}
