import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function AuthModal() {
  const {
    authModalOpen,
    authMode,
    setAuthMode,
    closeAuthModal,
    signInWithPassword,
    signInWithDemo,
    DEMO_CREDENTIALS,
    signUp,
  } = useAuth();

  const { isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  const modalRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && authModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  // Reset errors and fields when modal opens or mode switches
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
  }, [authMode, authModalOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  // 1-Click Demo Sign-In Handler
  const handleDemoSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setDemoSubmitting(true);
    try {
      await signInWithDemo();
      setSuccessMsg('Signed in with Demo Sentinel account! Enjoy full access.');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } catch (err) {
      console.error('Demo sign-in failed:', err);
      setErrorMsg('Demo sign in failed. Please try again or sign in manually.');
    } finally {
      setDemoSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (authMode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (authMode === 'register') {
        await signUp({ email: email.trim(), password, fullName: fullName.trim() });
        setSuccessMsg(
          'Account registered successfully! Check your email if verification is required, or sign in now.'
        );
        setTimeout(() => {
          setAuthMode('signin');
        }, 2000);
      } else {
        await signInWithPassword({ email: email.trim(), password });
        closeAuthModal();
      }
    } catch (err) {
      console.error('Auth submit error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
      onClick={(e) => {
        // Close modal when clicking backdrop outside the dialog
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md ${
          isDark
            ? 'bg-[#0c0924] border-purple-500/30 text-white shadow-purple-950/80'
            : 'bg-white border-emerald-300 text-slate-900 shadow-emerald-950/20'
        } border rounded-3xl shadow-2xl p-6 sm:p-8 relative transition-all duration-300 transform scale-100 overflow-hidden`}
      >
        {/* Subtle Ambient Glow inside modal */}
        <div
          className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-purple-600/20' : 'bg-emerald-500/20'
          }`}
        ></div>
        <div
          className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-indigo-600/20' : 'bg-teal-500/15'
          }`}
        ></div>

        {/* Close (X) button */}
        <button
          onClick={closeAuthModal}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-all duration-200 border ${
            isDark
              ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
              : 'text-slate-500 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
          }`}
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-base shadow-lg text-white ${
              isDark
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-600/30'
                : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/30'
            }`}
          >
            {'{ }'}
          </div>
          <div>
            <h2
              id="auth-modal-title"
              className={`text-xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-[#064e3b]'
              }`}
            >
              {authMode === 'register' ? 'Create Sentinel Account' : 'Sign In to API Sentinel'}
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-purple-200/70' : 'text-emerald-800/80'}`}>
              {authMode === 'register'
                ? 'Join to save test suites and monitor API performance'
                : 'Access your saved collections and test history'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          className={`grid grid-cols-2 gap-1 p-1 rounded-2xl border mb-5 ${
            isDark ? 'bg-[#141033] border-purple-500/20' : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              authMode === 'signin'
                ? isDark
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-emerald-800/70 hover:text-emerald-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              authMode === 'register'
                ? isDark
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-emerald-800/70 hover:text-emerald-950'
            }`}
          >
            Register
          </button>
        </div>

        {/* 1-Click Demo Sign-In Card (Instant Access) */}
        <div
          className={`mb-5 p-3.5 rounded-2xl border transition-all duration-200 ${
            isDark
              ? 'bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-purple-950/60 border-purple-500/40 shadow-lg shadow-purple-950/40'
              : 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border-emerald-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles
                className={`w-3.5 h-3.5 ${isDark ? 'text-purple-300' : 'text-emerald-600'}`}
              />
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-purple-200' : 'text-emerald-900'
                }`}
              >
                1-Click Demo Access
              </span>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isDark
                  ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              Instant Testing
            </span>
          </div>

          <p
            className={`text-[11px] leading-relaxed mb-3 ${
              isDark ? 'text-slate-300/90' : 'text-emerald-800/80'
            }`}
          >
            No registration required. Sign in instantly to test Collections, History, and API Settings.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={demoSubmitting || submitting}
              className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200 active:scale-[0.98] ${
                isDark
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20'
              }`}
            >
              {demoSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In as Demo User...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>1-Click Demo Sign-In</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_CREDENTIALS.email);
                setPassword(DEMO_CREDENTIALS.password);
                setAuthMode('signin');
              }}
              className={`text-[11px] font-semibold underline px-2 py-1 whitespace-nowrap transition-colors ${
                isDark
                  ? 'text-purple-300 hover:text-white'
                  : 'text-emerald-700 hover:text-emerald-950'
              }`}
            >
              Fill Credentials
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div
            className={`w-full border-t ${
              isDark ? 'border-purple-500/20' : 'border-emerald-200'
            }`}
          ></div>
          <span
            className={`absolute px-3 text-[10px] font-bold uppercase tracking-wider ${
              isDark ? 'bg-[#0c0924] text-slate-400' : 'bg-white text-emerald-800'
            }`}
          >
            Or {authMode === 'register' ? 'Register Account' : 'Manual Credentials'}
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-[#064e3b]'
                }`}
              >
                <User
                  className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`}
                />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivers"
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all duration-200 ${
                  isDark
                    ? 'bg-[#141033] border-purple-500/30 focus:border-purple-400 focus:bg-[#1a1542] text-white'
                    : 'bg-[#f4f8f6] border-emerald-300 focus:border-emerald-500 focus:bg-white text-emerald-950'
                }`}
              />
            </div>
          )}

          <div>
            <label
              className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-[#064e3b]'
              }`}
            >
              <Mail
                className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`}
              />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@sentinel.dev"
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all duration-200 ${
                isDark
                  ? 'bg-[#141033] border-purple-500/30 focus:border-purple-400 focus:bg-[#1a1542] text-white'
                  : 'bg-[#f4f8f6] border-emerald-300 focus:border-emerald-500 focus:bg-white text-emerald-950'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-[#064e3b]'
              }`}
            >
              <Lock
                className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`}
              />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all duration-200 ${
                isDark
                  ? 'bg-[#141033] border-purple-500/30 focus:border-purple-400 focus:bg-[#1a1542] text-white'
                  : 'bg-[#f4f8f6] border-emerald-300 focus:border-emerald-500 focus:bg-white text-emerald-950'
              }`}
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-[#064e3b]'
                }`}
              >
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`}
                />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all duration-200 ${
                  isDark
                    ? 'bg-[#141033] border-purple-500/30 focus:border-purple-400 focus:bg-[#1a1542] text-white'
                    : 'bg-[#f4f8f6] border-emerald-300 focus:border-emerald-500 focus:bg-white text-emerald-950'
                }`}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || demoSubmitting}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-1 text-white ${
              isDark
                ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{authMode === 'register' ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                <span>{authMode === 'register' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Modal Footer link */}
        <div
          className={`mt-5 pt-3.5 border-t text-center ${
            isDark ? 'border-purple-500/20' : 'border-emerald-200'
          }`}
        >
          {authMode === 'register' ? (
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`font-bold underline transition-colors ${
                  isDark
                    ? 'text-purple-400 hover:text-purple-300'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              New to API Sentinel?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`font-bold underline transition-colors ${
                  isDark
                    ? 'text-purple-400 hover:text-purple-300'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
