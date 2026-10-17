import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import {
  Settings,
  User,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Palette,
  Terminal,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  // Settings State
  const [themeChoice, setThemeChoice] = useState(theme || 'dark');
  const [timeoutMs, setTimeoutMs] = useState(10000);
  const [defaultHeaders, setDefaultHeaders] = useState('{\n  "Accept": "application/json"\n}');
  const [fullName, setFullName] = useState('');

  // Status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      try {
        setError('');
        // 1. Fetch preferences
        const { data: prefData, error: prefErr } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (prefErr && prefErr.code !== 'PGRST116') {
          console.warn('Error fetching preferences:', prefErr);
        }

        if (prefData) {
          setThemeChoice(prefData.theme_choice || 'dark');
          setTimeoutMs(prefData.timeout_ms || 10000);
          if (prefData.default_headers) {
            setDefaultHeaders(
              typeof prefData.default_headers === 'string'
                ? prefData.default_headers
                : JSON.stringify(prefData.default_headers, null, 2)
            );
          }
        }

        // 2. Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData?.full_name) {
          setFullName(profileData.full_name);
        } else if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
      } catch (err) {
        console.error('Settings error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    let parsedHeaders = {};
    try {
      if (defaultHeaders.trim()) {
        parsedHeaders = JSON.parse(defaultHeaders);
      }
    } catch {
      setError('Default Headers must be valid JSON.');
      setSaving(false);
      return;
    }

    try {
      // 1. Upsert user preferences
      const { error: upsertErr } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme_choice: themeChoice,
          timeout_ms: parseInt(timeoutMs, 10) || 10000,
          default_headers: parsedHeaders,
        });

      if (upsertErr) throw upsertErr;

      // 2. Update profile name if changed
      if (fullName.trim()) {
        await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className={`pb-2 border-b ${isDark ? 'border-blue-500/20' : 'border-emerald-200'}`}>
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
          Sentinel Preferences &amp; Profile
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-blue-200/70' : 'text-emerald-800/80'}`}>
          Customize request runner defaults, timeout thresholds, and inspect security identity.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated and persisted to Supabase!</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-blue-200/70 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-xs font-semibold">Retrieving preferences from Supabase...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Identity & Profile Card */}
          <div className="blue-card p-6 rounded-2xl space-y-4">
            <div className={`flex items-center gap-3 pb-3 border-b ${isDark ? 'border-blue-500/20' : 'border-emerald-200'}`}>
              <div className={`p-2 rounded-xl border ${isDark ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>Security Identity</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>Authenticated Supabase user profile</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>Email Address:</span>
                <p className={`font-mono mt-0.5 font-medium ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>{user?.email}</p>
              </div>
              <div>
                <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>User UUID (auth.uid):</span>
                <p className={`font-mono truncate mt-0.5 ${isDark ? 'text-blue-300/70' : 'text-emerald-700/90'}`}>{user?.id}</p>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                Display / Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Name"
                className={`w-full sm:max-w-md px-3.5 py-2 rounded-xl text-xs outline-none transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0f172a] border border-blue-500/30 text-white focus:border-blue-400 focus:bg-[#1e293b]'
                    : 'bg-[#f4f8f6] border border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Test Runner Settings Form */}
          <form
            onSubmit={handleSaveSettings}
            className="blue-card p-6 rounded-2xl space-y-6"
          >
            <div className={`flex items-center gap-3 pb-3 border-b ${isDark ? 'border-blue-500/20' : 'border-emerald-200'}`}>
              <div className={`p-2 rounded-xl border ${isDark ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>Execution Parameters</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>Defaults loaded on every test session</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Theme Choice */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                  <Palette className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-emerald-600'}`} />
                  <span>Theme Choice</span>
                </label>
                <select
                  value={themeChoice}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setThemeChoice(chosen);
                    setTheme(chosen);
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold outline-none transition-all duration-200 ${
                    isDark
                      ? 'bg-[#0f172a] border border-blue-500/30 text-white focus:border-blue-400 focus:bg-[#1e293b]'
                      : 'bg-[#f4f8f6] border border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:bg-white'
                  }`}
                >
                  <option value="dark">Dark Theme (Kong Cosmic Blue &amp; Pitch Black)</option>
                  <option value="light">Light Theme (Mint Green + Emerald + Deep Forest Green on Soft Off-White)</option>
                </select>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-emerald-800/70'}`}>
                  Instant live preview and synced to user preferences.
                </p>
              </div>

              {/* Request Timeout */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                  <Clock className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-emerald-600'}`} />
                  <span>Default Timeout (ms)</span>
                </label>
                <input
                  type="number"
                  min={1000}
                  max={60000}
                  step={500}
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl font-mono text-xs outline-none transition-all duration-200 ${
                    isDark
                      ? 'bg-[#0f172a] border border-blue-500/30 text-white focus:border-blue-400 focus:bg-[#1e293b]'
                      : 'bg-[#f4f8f6] border border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:bg-white'
                  }`}
                />
                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-emerald-800/70'}`}>
                  Maximum execution window before aborting test calls (default 10000 ms).
                </p>
              </div>
            </div>

            {/* Default Headers */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                <Terminal className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-emerald-600'}`} />
                <span>Default Request Headers (JSON)</span>
              </label>
              <textarea
                rows={4}
                value={defaultHeaders}
                onChange={(e) => setDefaultHeaders(e.target.value)}
                className={`w-full p-3 rounded-xl font-mono text-xs outline-none transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0f172a] border border-blue-500/30 text-white focus:border-blue-400 focus:bg-[#1e293b]'
                    : 'bg-[#f4f8f6] border border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:bg-white'
                }`}
                placeholder='{ "Accept": "application/json" }'
              />
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-emerald-800/70'}`}>
                JSON object of baseline headers appended to new tests.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 text-white ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
