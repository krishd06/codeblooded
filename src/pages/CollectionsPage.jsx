import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import {
  FolderGit2,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';

export default function CollectionsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Request Form State
  const [newName, setNewName] = useState('');
  const [newMethod, setNewMethod] = useState('GET');
  const [newUrl, setNewUrl] = useState('');
  const [newExpStatus, setNewExpStatus] = useState('200');
  const [newExpKeys, setNewExpKeys] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCollections = async () => {
    if (!user) return;
    try {
      setError('');
      const { data, error: fetchErr } = await supabase
        .from('saved_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setCollections(data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err.message || 'Failed to load collections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [user]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setCreating(true);

    try {
      const expKeys = newExpKeys
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const { data, error: insertErr } = await supabase
        .from('saved_requests')
        .insert({
          user_id: user.id,
          name: newName || `${newMethod} ${newUrl}`,
          method: newMethod,
          url: newUrl,
          headers: { 'Content-Type': 'application/json' },
          expected_status: parseInt(newExpStatus, 10) || 200,
          expected_keys: expKeys,
        })
        .select();

      if (insertErr) throw insertErr;
      if (data) setCollections([data[0], ...collections]);
      setShowCreateModal(false);
      setNewName('');
      setNewUrl('');
      setNewExpKeys('');
    } catch (err) {
      alert(`Failed to create request: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved request from your collection?')) return;
    try {
      const { error: delErr } = await supabase
        .from('saved_requests')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (delErr) throw delErr;
      setCollections(collections.filter((c) => c.id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleRunInTester = (item) => {
    navigate('/tester', {
      state: {
        prefill: item,
      },
    });
  };

  const getMethodBadge = (m) => {
    switch (m) {
      case 'GET':
        return 'text-emerald-400 border-emerald-800/80 bg-emerald-950/60';
      case 'POST':
        return 'text-purple-400 border-purple-800/80 bg-purple-950/60';
      case 'PUT':
      case 'PATCH':
        return 'text-amber-400 border-amber-800/80 bg-amber-950/60';
      case 'DELETE':
        return 'text-rose-400 border-rose-800/80 bg-rose-950/60';
      default:
        return 'text-slate-300 border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
            Saved Collections
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-purple-200/70' : 'text-emerald-800/80'}`}>
            Organize test endpoints and contract assertions into reusable suites backed by Supabase.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all duration-200 text-white ${
            isDark
              ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>New Saved Request</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Collections Grid */}
      {loading ? (
        <div className={`p-12 text-center flex flex-col items-center justify-center gap-3 ${isDark ? 'text-purple-200/70' : 'text-emerald-800/70'}`}>
          <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-purple-400' : 'text-emerald-600'}`} />
          <span className="text-xs font-semibold">Loading collections from Supabase...</span>
        </div>
      ) : collections.length === 0 ? (
        <div className="purple-card p-12 text-center space-y-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
            isDark
              ? 'bg-[#141033] border-purple-500/30 text-purple-400'
              : 'bg-emerald-100 border-emerald-300 text-emerald-800'
          }`}>
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>No saved requests yet</h3>
            <p className={`text-xs max-w-sm mx-auto mt-1 ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>
              Create your first saved request or save one directly while testing in the API Workspace.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 text-white ${
              isDark
                ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Request</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map((item) => (
            <div
              key={item.id}
              className="purple-card p-5 rounded-2xl space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs border ${getMethodBadge(
                      item.method
                    )}`}
                  >
                    {item.method}
                  </span>
                  <h3 className={`text-sm font-bold truncate max-w-[220px] ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    {item.name || 'Untitled Request'}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRunInTester(item)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isDark
                        ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white'
                    }`}
                    title="Load in API Workspace"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isDark
                        ? 'bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
                        : 'bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Delete Request"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border font-mono text-xs truncate font-medium ${
                isDark
                  ? 'bg-[#08061a] border-purple-500/20 text-slate-200'
                  : 'bg-[#f4f8f6] border-emerald-200 text-emerald-950'
              }`}>
                {item.url}
              </div>

              <div className={`flex flex-wrap items-center gap-3 text-xs pt-1 ${isDark ? 'text-slate-400' : 'text-emerald-800/80'}`}>
                {item.expected_status && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status: {item.expected_status}</span>
                  </span>
                )}

                {item.expected_keys && item.expected_keys.length > 0 && (
                  <span className={`flex items-center gap-1 font-semibold ${isDark ? 'text-purple-300' : 'text-emerald-700'}`}>
                    <Tag className="w-3.5 h-3.5" />
                    <span>{item.expected_keys.length} key checks</span>
                  </span>
                )}

                <span className={`ml-auto text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className={`border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl transition-all duration-200 space-y-4 ${
            isDark
              ? 'bg-[#0c0924] border-purple-500/30 text-white shadow-purple-950/80'
              : 'bg-white border-emerald-300 text-slate-900 shadow-emerald-950/20'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>Save New Request</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`font-bold text-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                  Request Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Get User Profile"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all duration-200 ${
                    isDark
                      ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400 focus:bg-[#1a1542]'
                      : 'bg-[#f4f8f6] border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:bg-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                    Method
                  </label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all duration-200 ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400'
                        : 'bg-[#f4f8f6] border-emerald-300 text-emerald-950 focus:border-emerald-500'
                    }`}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                    URL Endpoint
                  </label>
                  <input
                    type="text"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none transition-all duration-200 ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400 focus:bg-[#1a1542]'
                        : 'bg-[#f4f8f6] border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                    Expected Status
                  </label>
                  <input
                    type="number"
                    value={newExpStatus}
                    onChange={(e) => setNewExpStatus(e.target.value)}
                    placeholder="200"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none transition-all duration-200 ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400'
                        : 'bg-[#f4f8f6] border-emerald-300 text-emerald-950 focus:border-emerald-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                    Expected Keys
                  </label>
                  <input
                    type="text"
                    value={newExpKeys}
                    onChange={(e) => setNewExpKeys(e.target.value)}
                    placeholder="id, status"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none transition-all duration-200 ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400'
                        : 'bg-[#f4f8f6] border-emerald-300 text-emerald-950 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex justify-end gap-2 pt-3 border-t ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isDark
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 text-white ${
                    isDark
                      ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
                  }`}
                >
                  {creating ? 'Saving...' : 'Save Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
