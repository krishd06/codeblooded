import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setError('');
      const { data, error: fetchErr } = await supabase
        .from('request_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchErr) throw fetchErr;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to load request history.');
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
      const { error: delErr } = await supabase
        .from('request_history')
        .delete()
        .eq('user_id', user.id);
      if (delErr) throw delErr;
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
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'POST':
        return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
      case 'PUT':
      case 'PATCH':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'DELETE':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Request History & Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit logs of previous API execution benchmarks and contract results.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all duration-300"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-800/60 text-xs font-medium transition-all duration-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Total Invocations</div>
          <div className="text-2xl font-bold text-white mt-1">{totalRuns}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Average Latency</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{avgLatency} ms</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Assertions Passed</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{totalPassed}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Assertions Failed</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{totalFailed}</div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* History Table or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-sm">Loading request history from Supabase...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No requests recorded yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Dispatch an API call in the tester sandbox to start recording performance history and assertion audits.
            </p>
          </div>
          <button
            onClick={() => navigate('/tester')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all duration-300"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Tester</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400">
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Target URL</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Assertions</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {history.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/30 transition-all duration-300"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-[11px] border ${getMethodBadge(
                          row.method
                        )}`}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 truncate max-w-xs">
                      {row.url}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status >= 200 && row.status < 400
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
                        }`}
                      >
                        {row.status || 'Err'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {row.response_time_ms} ms
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          {row.passed || 0}
                        </span>
                        {row.failed > 0 && (
                          <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                            <XCircle className="w-3 h-3" />
                            {row.failed}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRetest(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-[11px] font-medium transition-all duration-300"
                        title="Re-run in Tester"
                      >
                        <Play className="w-3 h-3 fill-indigo-300" />
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
