import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Activity,
  FolderGit2,
  Clock,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Lock,
} from 'lucide-react';

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const navItems = [
    { name: 'Overview', to: '/', icon: Shield, isProtected: false },
    { name: 'API Tester', to: '/tester', icon: Activity, isProtected: false },
    { name: 'Collections', to: '/collections', icon: FolderGit2, isProtected: true },
    { name: 'History', to: '/history', icon: Clock, isProtected: true },
    { name: 'Settings', to: '/settings', icon: Settings, isProtected: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-3 group transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-all duration-300">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-all duration-300">
                      API Sentinel
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      v1.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
                    Autonomous API Testing Suite
                  </p>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-slate-900 text-indigo-400 border border-slate-800 shadow-sm'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      {item.isProtected && !user && (
                        <Lock className="w-3 h-3 text-slate-600 ml-0.5" />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Right Action / Auth State */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-left text-xs">
                      <div className="font-medium text-slate-200 truncate max-w-[140px]">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/50 transition-all duration-300"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/tester"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all duration-300"
                  >
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Try Sandbox</span>
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-[0.98]"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all duration-300"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-slate-900 text-indigo-400 border border-slate-800'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.isProtected && !user && (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </NavLink>
              );
            })}

            <div className="pt-3 mt-2 border-t border-slate-800">
              {user ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 px-3 py-1">
                    Signed in as <span className="text-slate-200 font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Sign Up</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90 py-6 text-xs text-slate-500 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Sentinel Engine Online</span>
            <span className="text-slate-700">•</span>
            <span>Supabase RLS Protected</span>
          </div>
          <div>
            Built with React, Vite, Tailwind CSS & Supabase
          </div>
        </div>
      </footer>
    </div>
  );
}
