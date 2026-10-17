import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthModal from './AuthModal';
import {
  Activity,
  FolderGit2,
  Clock,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Lock,
  Play,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';

export default function Layout() {
  const { user, signOut, openAuthModal } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Floating "Access Restricted" Toast State
  const [restrictedNotice, setRestrictedNotice] = useState(null);
  const noticeTimerRef = useRef(null);

  const showRestrictedMessage = (pageName) => {
    setRestrictedNotice({
      pageName,
      message: `${pageName} is locked. Sign in to view and manage your test suites. Use our 1-Click Demo for instant access!`,
    });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setRestrictedNotice(null);
    }, 5500);
  };

  // Catch redirects from ProtectedRoute
  useEffect(() => {
    if (location.state?.accessRestricted) {
      const page = location.state.pageName || 'Protected Workspace';
      showRestrictedMessage(page);
    }
  }, [location]);

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
    { name: 'Overview', to: '/', icon: Activity, isProtected: false },
    { name: 'API Workspace', to: '/tester', icon: Play, isProtected: false },
    { name: 'Collections', to: '/collections', icon: FolderGit2, isProtected: true },
    { name: 'History', to: '/history', icon: Clock, isProtected: true },
    { name: 'Settings', to: '/settings', icon: Settings, isProtected: true },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-[#000000] text-slate-100 selection:bg-blue-600 selection:text-white'
          : 'bg-[#f4f8f6] text-[#064e3b] selection:bg-emerald-500 selection:text-white'
      }`}
    >
      {/* Top Navbar matching active theme */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
          isDark
            ? 'bg-[#000000]/95 border-white/5'
            : 'bg-[#f4f8f6]/95 border-emerald-900/10 shadow-sm shadow-emerald-950/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-3 group transition-all duration-300"
              >
                <div
                  className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-mono font-bold text-sm shadow-lg group-hover:scale-105 transition-all duration-200 ${
                    isDark
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/30'
                      : 'bg-gradient-to-br from-emerald-600 to-teal-800 shadow-emerald-600/30'
                  }`}
                >
                  {'{ }'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-extrabold text-base sm:text-lg tracking-tight transition-all duration-200 ${
                        isDark
                          ? 'text-white group-hover:text-blue-300'
                          : 'text-[#064e3b] group-hover:text-emerald-700'
                      }`}
                    >
                      API Sentinel
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${
                        isDark
                          ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      v2.0
                    </span>
                  </div>
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
                      onClick={(e) => {
                        if (item.isProtected && !user) {
                          e.preventDefault();
                          showRestrictedMessage(item.name);
                        }
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? isDark
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                              : 'bg-emerald-600/15 text-[#064e3b] border border-emerald-500/30 font-bold shadow-sm'
                            : isDark
                            ? 'text-slate-300 hover:text-white hover:bg-white/5'
                            : 'text-[#065f46] hover:text-[#064e3b] hover:bg-emerald-100/60'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                      {item.isProtected && !user && (
                        <Lock
                          className={`w-3 h-3 ml-0.5 ${
                            isDark ? 'text-blue-400/50' : 'text-emerald-600/50'
                          }`}
                        />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Right Action / Theme Switcher / Auth State */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Switcher Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-200 border flex items-center gap-1.5 text-xs font-semibold ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] border-emerald-200'
                }`}
                title={
                  isDark
                    ? 'Switch to Light Theme (Mint Green & Emerald)'
                    : 'Switch to Dark Theme (Sapphire Blue)'
                }
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden xl:inline text-[11px]">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-emerald-800" />
                    <span className="hidden xl:inline text-[11px]">Dark Mode</span>
                  </>
                )}
              </button>

              <Link
                to="/tester"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md transition-all duration-200 active:scale-[0.98] ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
                }`}
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Launch API Tester</span>
              </Link>

              {user ? (
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                      isDark
                        ? 'bg-[#0f172a] border-blue-500/30'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full text-white font-bold flex items-center justify-center text-[11px] ${
                        isDark ? 'bg-blue-600' : 'bg-emerald-700'
                      }`}
                    >
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span
                      className={`text-xs font-semibold max-w-[120px] truncate ${
                        isDark ? 'text-slate-200' : 'text-[#064e3b]'
                      }`}
                    >
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className={`p-2 rounded-lg border transition-all duration-200 ${
                      isDark
                        ? 'bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-white/10 hover:border-rose-800/50'
                        : 'bg-emerald-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-emerald-200 hover:border-rose-300'
                    }`}
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 active:scale-[0.98] ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-[#064e3b] border-emerald-300'
                  }`}
                >
                  <User
                    className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-emerald-700'}`}
                  />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu trigger + theme toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-emerald-800" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/10'
                    : 'text-[#064e3b] hover:bg-emerald-100'
                }`}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden border-b px-4 pt-2 pb-4 space-y-1 ${
              isDark
                ? 'border-blue-900/40 bg-[#080d1a]'
                : 'border-emerald-200 bg-[#f4f8f6]'
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={(e) => {
                    if (item.isProtected && !user) {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      showRestrictedMessage(item.name);
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-600/15 text-[#064e3b] border border-emerald-500/30 font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-white/5'
                        : 'text-[#065f46] hover:bg-emerald-100/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.isProtected && !user && (
                    <Lock className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400/50' : 'text-emerald-600/50'}`} />
                  )}
                </NavLink>
              );
            })}

            <div
              className={`pt-3 mt-2 border-t space-y-2 ${
                isDark ? 'border-blue-900/40' : 'border-emerald-200'
              }`}
            >
              <Link
                to="/tester"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white shadow-md ${
                  isDark
                    ? 'bg-blue-600 shadow-blue-600/30'
                    : 'bg-emerald-600 shadow-emerald-700/20'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch API Tester</span>
              </Link>

              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border ${
                    isDark
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-emerald-100 text-[#064e3b] border-emerald-300'
                  }`}
                >
                  <User className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-emerald-700'}`} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Floating Access Restricted Message Toast */}
      {restrictedNotice && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-96 animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 relative overflow-hidden backdrop-blur-xl transition-all duration-300 ${
              isDark
                ? 'bg-[#0a1122]/95 border-amber-500/40 text-white shadow-blue-950/90'
                : 'bg-white/95 border-amber-500/40 text-slate-900 shadow-emerald-950/20'
            }`}
            role="alert"
          >
            {/* Top decorative accent line */}
            <div
              className={`absolute top-0 inset-x-0 h-1 ${
                isDark
                  ? 'bg-gradient-to-r from-amber-500 via-blue-500 to-indigo-500'
                  : 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500'
              }`}
            />

            <div
              className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <Lock className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-wider ${
                    isDark ? 'text-amber-400' : 'text-amber-800'
                  }`}
                >
                  Access Restricted
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isDark
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  Sign In Required
                </span>
              </div>
              <p
                className={`text-xs mt-1.5 leading-relaxed font-medium ${
                  isDark ? 'text-slate-200' : 'text-emerald-950'
                }`}
              >
                {restrictedNotice.message}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRestrictedNotice(null);
                    openAuthModal('signin');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-200 active:scale-95 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
                  }`}
                >
                  ⚡ 1-Click Demo / Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setRestrictedNotice(null)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRestrictedNotice(null)}
              className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-black/5'
              }`}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Page Container */}
      <main className="w-full flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-8 text-xs relative z-10 transition-colors duration-300 ${
          isDark
            ? 'border-blue-900/30 bg-[#000000] text-slate-400'
            : 'border-emerald-900/10 bg-[#eef4f0] text-emerald-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span
              className={`font-semibold ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}
            >
              API Sentinel Engine Online
            </span>
            <span className={isDark ? 'text-blue-400' : 'text-emerald-600'}>•</span>
            <span>Real-time Proxy &amp; Contract Verification</span>
          </div>
          <div className={isDark ? 'text-blue-300/60' : 'text-emerald-800/80 font-medium'}>
            Built with React, Vite, Tailwind CSS &amp; Supabase
          </div>
        </div>
      </footer>

      {/* Centered Authentication Modal Dialog with 1-Click Demo */}
      <AuthModal />
    </div>
  );
}
