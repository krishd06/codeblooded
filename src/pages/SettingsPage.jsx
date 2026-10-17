import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
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

  // Settings State
  const [themeChoice, setThemeChoice] = useState('dark');
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Sentinel Preferences & Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize request runner defaults, timeout thresholds, and inspect security identity.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated and persisted to Supabase!</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-sm">Retrieving preferences...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Identity & Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Security Identity</h3>
                <p className="text-xs text-slate-400">Authenticated Supabase user profile</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Email Address:</span>
                <p className="font-mono text-slate-200 mt-0.5">{user?.email}</p>
              </div>
              <div>
                <span className="text-slate-400">User UUID (auth.uid):</span>
                <p className="font-mono text-slate-400 truncate mt-0.5">{user?.id}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Display / Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Name"
                className="w-full sm:max-w-md px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Test Runner Settings Form */}
          <form
            onSubmit={handleSaveSettings}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Execution Parameters</h3>
                <p className="text-xs text-slate-400">Defaults loaded on every test session</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Theme Choice */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>Theme Choice</span>
                </label>
                <select
                  value={themeChoice}
                  onChange={(e) => setThemeChoice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold outline-none focus:border-indigo-500 transition-all duration-300"
                >
                  <option value="dark">Sentinel Dark (bg-slate-950)</option>
                  <option value="midnight">Midnight Black</option>
                  <option value="high-contrast">High Contrast Dark</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default theme token preference stored in user_preferences table.
                </p>
              </div>

              {/* Request Timeout */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Default Timeout (ms)</span>
                </label>
                <input
                  type="number"
                  min={1000}
                  max={60000}
                  step={500}
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500 transition-all duration-300"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Maximum execution window before aborting test calls (default 10000 ms).
                </p>
              </div>
            </div>

            {/* Default Headers */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Default Request Headers (JSON)</span>
              </label>
              <textarea
                rows={4}
                value={defaultHeaders}
                onChange={(e) => setDefaultHeaders(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all duration-300"
                placeholder='{ "Accept": "application/json" }'
              />
              <p className="text-[11px] text-slate-500 mt-1">
                JSON object of baseline headers appended to new tests.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
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
