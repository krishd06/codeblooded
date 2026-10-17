import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import {
  Clock,
  RotateCw,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const LOCAL_HISTORY_KEY = 'sentinel_request_history';

  const getInitialFallbackHistory = () => [
    {
      id: 101,
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      status: 200,
      response_time_ms: 142,
      passed: 3,
      failed: 0,
      created_at: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 102,
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      status: 201,
      response_time_ms: 380,
      passed: 2,
      failed: 0,
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 103,
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users/1',
      status: 200,
      response_time_ms: 210,
      passed: 4,
      failed: 0,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const fetchHistory = async () => {
    try {
      setError('');
      if (user && user.id && !user.id.startsWith('00000000-demo')) {
        const { data, error: fetchErr } = await supabase
          .from('request_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (!fetchErr && data && data.length > 0) {
          setHistory(data);
          try {
            localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(data));
          } catch (e) {}
          return;
        }
      }

      // Check local storage for tester executions
      const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          const mapped = parsed.map((item) => ({
            id: item.id || Date.now(),
            method: item.method || 'GET',
            url: item.url || '',
            status: item.status || 200,
            response_time_ms: item.timeMs || item.response_time_ms || 150,
            passed: item.passed || 0,
            failed: item.failed || 0,
            created_at: item.timestamp || new Date().toISOString(),
          }));
          setHistory(mapped);
          return;
        }
      }

      // Default demo entries
      setHistory(getInitialFallbackHistory());
    } catch (err) {
      console.warn('Error fetching history, reading local history storage:', err);
      try {
        const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
        setHistory(stored ? JSON.parse(stored) : getInitialFallbackHistory());
      } catch (e) {
        setHistory(getInitialFallbackHistory());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete your request history logs?')) {
      return;
    }
    try {
      if (user && user.id && !user.id.startsWith('00000000-demo')) {
        try {
          await supabase
            .from('request_history')
            .delete()
            .eq('user_id', user.id);
        } catch (dbErr) {
          console.warn('Could not clear Supabase history:', dbErr);
        }
      }
      localStorage.removeItem(LOCAL_HISTORY_KEY);
      setHistory([]);
    } catch (err) {
      alert(`Failed to clear history: ${err.message}`);
    }
  };

  const handleRetest = (item) => {
    navigate('/tester', {
      state: {
        prefill: {
          method: item.method,
          url: item.url,
          name: `${item.method} re-test`,
        },
      },
    });
  };

  const getMethodBadge = (m) => {
    switch (m) {
      case 'GET':
        return 'text-emerald-400 border-emerald-800/80 bg-emerald-950/60';
      case 'POST':
        return 'text-blue-400 border-blue-800/80 bg-blue-950/60';
      case 'PUT':
      case 'PATCH':
        return 'text-amber-400 border-amber-800/80 bg-amber-950/60';
      case 'DELETE':
        return 'text-rose-400 border-rose-800/80 bg-rose-950/60';
      default:
        return 'text-slate-300 border-slate-700 bg-slate-900';
    }
  };

  // Metrics
  const totalRuns = history.length;
  const avgLatency =
    totalRuns > 0
      ? Math.round(
          history.reduce((acc, curr) => acc + (curr.response_time_ms || 0), 0) /
            totalRuns
        )
      : 0;
  const totalPassed = history.reduce((acc, curr) => acc + (curr.passed || 0), 0);
  const totalFailed = history.reduce((acc, curr) => acc + (curr.failed || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b ${isDark ? 'border-blue-500/20' : 'border-emerald-200'}`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
            Request History &amp; Logs
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-blue-200/70' : 'text-emerald-800/80'}`}>
            Audit logs of previous API execution benchmarks and contract results stored in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 ${
              isDark
                ? 'bg-[#0f172a] hover:bg-[#1e293b] text-slate-200 border border-blue-500/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] border border-emerald-300'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-emerald-600'} ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isDark
                  ? 'bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-800/40'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="blue-card p-4 rounded-2xl">
          <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>Total Invocations</div>
          <div className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>{totalRuns}</div>
        </div>
        <div className="blue-card p-4 rounded-2xl">
          <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>Average Latency</div>
          <div className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-blue-400' : 'text-emerald-600'}`}>{avgLatency} ms</div>
        </div>
        <div className="blue-card p-4 rounded-2xl">
          <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>Assertions Passed</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{totalPassed}</div>
        </div>
        <div className="blue-card p-4 rounded-2xl">
          <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>Assertions Failed</div>
          <div className="text-2xl font-extrabold text-rose-500 mt-1">{totalFailed}</div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* History Table or Empty State */}
      {loading ? (
        <div className={`p-12 text-center flex flex-col items-center justify-center gap-3 ${isDark ? 'text-blue-200/70' : 'text-emerald-800/70'}`}>
          <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-blue-400' : 'text-emerald-600'}`} />
          <span className="text-xs font-semibold">Loading request history from Supabase...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="blue-card p-12 text-center space-y-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
            isDark
              ? 'bg-[#0f172a] border-blue-500/30 text-blue-400'
              : 'bg-emerald-100 border-emerald-300 text-emerald-800'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>No requests recorded yet</h3>
            <p className={`text-xs max-w-sm mx-auto mt-1 ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>
              Dispatch an API call in the tester sandbox to start recording performance history and assertion audits.
            </p>
          </div>
          <button
            onClick={() => navigate('/tester')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 text-white ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Tester</span>
          </button>
        </div>
      ) : (
        <div className="blue-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b ${isDark ? 'border-blue-500/20 bg-[#0f172a] text-slate-300' : 'border-emerald-200 bg-[#ecfdf5] text-[#064e3b]'}`}>
                  <th className="py-3 px-4 font-bold">Method</th>
                  <th className="py-3 px-4 font-bold">Target URL</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Latency</th>
                  <th className="py-3 px-4 font-bold">Assertions</th>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-blue-500/10' : 'divide-emerald-100'}`}>
                {history.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-all duration-200 ${isDark ? 'hover:bg-white/5' : 'hover:bg-emerald-50/60'}`}
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${getMethodBadge(
                          row.method
                        )}`}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-mono truncate max-w-xs font-medium ${isDark ? 'text-slate-200' : 'text-emerald-950'}`}>
                      {row.url}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.status >= 200 && row.status < 400
                            ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80'
                            : 'bg-rose-950/70 text-rose-400 border-rose-800/80'
                        }`}
                      >
                        {row.status || 'Err'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-400' : 'text-emerald-800'}`}>
                      {row.response_time_ms} ms
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {row.passed || 0}
                        </span>
                        {row.failed > 0 && (
                          <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            {row.failed}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRetest(row)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                          isDark
                            ? 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                        }`}
                        title="Re-run in Tester"
                      >
                        <Play className={`w-3 h-3 ${isDark ? 'fill-blue-300' : 'fill-emerald-800'}`} />
                        <span>Run</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
