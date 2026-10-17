import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Saved Collections
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize test endpoints and contract assertions into reusable suites.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span>New Saved Request</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Collections Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-sm">Loading collections from Supabase...</span>
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No saved requests yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Create your first saved request or save one directly while testing in the Sandbox.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all duration-300"
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
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all duration-300 space-y-3 group shadow-lg"
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
                  <h3 className="text-sm font-bold text-white truncate max-w-[220px]">
                    {item.name || 'Untitled Request'}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRunInTester(item)}
                    className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                    title="Load in Sandbox"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all duration-300"
                    title="Delete Request"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 truncate">
                {item.url}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                {item.expected_status && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status: {item.expected_status}</span>
                  </span>
                )}

                {item.expected_keys && item.expected_keys.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{item.expected_keys.length} key checks</span>
                  </span>
                )}

                <span className="ml-auto text-[11px] text-slate-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Save New Request</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Request Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Get User Profile"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Method
                  </label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    URL Endpoint
                  </label>
                  <input
                    type="text"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Status
                  </label>
                  <input
                    type="number"
                    value={newExpStatus}
                    onChange={(e) => setNewExpStatus(e.target.value)}
                    placeholder="200"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Keys
                  </label>
                  <input
                    type="text"
                    value={newExpKeys}
                    onChange={(e) => setNewExpKeys(e.target.value)}
                    placeholder="id, status"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all duration-300"
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
