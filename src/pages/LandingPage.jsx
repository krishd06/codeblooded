import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Zap,
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
  AlertCircle,
  Loader2,
  FolderGit2,
} from 'lucide-react';

export default function LandingPage() {
  const { user, signInWithPassword, signUp } = useAuth();
  const navigate = useNavigate();

  // Auth Card State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (isSignUp) {
        await signUp({ email, password, fullName });
        setSuccessMsg(
          'Account created successfully! Check your email if verification is required, or sign in.'
        );
      } else {
        await signInWithPassword({ email, password });
        navigate('/tester');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>High-Velocity API Testing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stress-test, validate, and monitor APIs{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-500">
              in milliseconds.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            API Sentinel is an autonomous testing suite designed for developers.
            Execute requests, validate key contracts, benchmark latency, and store test collections
            backed by real-time Supabase Row Level Security.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/tester"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/30 transition-all duration-300 active:scale-[0.98]"
            >
              <Activity className="w-5 h-5" />
              <span>Launch API Tester</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            {user ? (
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold transition-all duration-300 active:scale-[0.98]"
              >
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <span>My Collections</span>
              </Link>
            ) : (
              <a
                href="#auth-section"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold transition-all duration-300 active:scale-[0.98]"
              >
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>Create Sentinel Account</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">0 ms</div>
              <div className="text-xs text-slate-400">Cold Start Overhead</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">100%</div>
              <div className="text-xs text-slate-400">RLS Isolated Data</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400 tracking-tight">Postgres</div>
              <div className="text-xs text-slate-400">Supabase Backend</div>
            </div>
          </div>
        </div>

        {/* Auth / Account Card */}
        <div id="auth-section" className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/20 relative overflow-hidden transition-all duration-300">
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

            {user ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">
                    Welcome back, {user.user_metadata?.full_name || 'Sentinel User'}
                  </h3>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>User ID:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[180px]">{user.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Security Tier:</span>
                    <span className="text-emerald-400 font-semibold">Row Level Security</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/tester"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all duration-300"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Open API Tester</span>
                  </Link>
                  <Link
                    to="/history"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all duration-300"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Request History</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {isSignUp ? 'Create Sentinel Account' : 'Sign in to Sentinel'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Save test suites, collections, and inspect history logs.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`py-2 text-xs font-semibold rounded-md transition-all duration-300 ${
                      !isSignUp
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`py-2 text-xs font-semibold rounded-md transition-all duration-300 ${
                      isSignUp
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitAuth} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivers"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm outline-none transition-all duration-300"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="developer@sentinel.dev"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm outline-none transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm outline-none transition-all duration-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Live HTTP Tester</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Execute GET, POST, PUT, DELETE, and PATCH calls with real-time status badges, response headers, and ms timing.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Schema & Status Assertions</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Verify expected status codes and json response keys automatically on every single request run.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Supabase RLS Architecture</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Profiles, saved requests, history records, and preferences are secured per user through Postgres Row Level Security.
          </p>
        </div>
      </div>
    </div>
  );
}
