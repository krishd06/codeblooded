import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Copy,
  Check,
  BookmarkPlus,
} from 'lucide-react';

export default function TesterPage() {
  const { user } = useAuth();
  const location = useLocation();

  // Form State
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headersJson, setHeadersJson] = useState('{\n  "Content-Type": "application/json"\n}');
  const [bodyText, setBodyText] = useState('{\n  "title": "API Sentinel Test",\n  "completed": false\n}');
  const [expectedStatus, setExpectedStatus] = useState('200');
  const [expectedKeys, setExpectedKeys] = useState('id, title, completed');
  const [requestName, setRequestName] = useState('Get Todo Item');

  // UI Tabs
  const [activeReqTab, setActiveReqTab] = useState('headers'); // 'headers' | 'body' | 'assertions'
  const [activeResTab, setActiveResTab] = useState('body'); // 'body' | 'headers'

  // Execution & Response State
  const [useProxy, setUseProxy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [responseMeta, setResponseMeta] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load request from location.state if navigated from Collections
  useEffect(() => {
    if (location.state?.prefill) {
      const p = location.state.prefill;
      if (p.method) setMethod(p.method);
      if (p.url) setUrl(p.url);
      if (p.name) setRequestName(p.name);
      if (p.headers) setHeadersJson(typeof p.headers === 'string' ? p.headers : JSON.stringify(p.headers, null, 2));
      if (p.body) setBodyText(p.body);
      if (p.expected_status) setExpectedStatus(String(p.expected_status));
      if (p.expected_keys) setExpectedKeys(Array.isArray(p.expected_keys) ? p.expected_keys.join(', ') : p.expected_keys);
    }
  }, [location.state]);

  const handleSendRequest = async () => {
    setLoading(true);
    setSaveStatus('');
    const startTime = performance.now();

    let parsedHeaders = {};
    try {
      if (headersJson.trim()) {
        parsedHeaders = JSON.parse(headersJson);
      }
    } catch {
      alert('Invalid JSON in Request Headers. Please fix the syntax.');
      setLoading(false);
      return;
    }

    // 1. If useProxy is enabled, dispatch through Vercel serverless function /api/proxy
    if (useProxy) {
      try {
        const proxyRes = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            method,
            headers: parsedHeaders,
            body: ['POST', 'PUT', 'PATCH'].includes(method) ? bodyText : undefined,
            timeoutMs: 15000,
          }),
        });

        const proxyData = await proxyRes.json();

        if (!proxyData.ok) {
          setResponseMeta({
            status: 0,
            statusText: proxyData.errorType ? `Proxy Error: ${proxyData.errorType}` : 'Proxy Failure',
            responseTimeMs: 0,
            headers: {},
            body: `Proxy Error (${proxyData.errorType || 'unknown'}):\n${proxyData.message || 'Upstream request failed'}`,
            statusPassed: false,
            allKeysPassed: false,
            keysChecked: [],
            passedCount: 0,
            failedCount: 1,
          });
          setLoading(false);
          return;
        }

        let parsedData = null;
        try {
          parsedData = JSON.parse(proxyData.body);
        } catch {}

        const expStatusNum = parseInt(expectedStatus, 10);
        const statusPassed = !isNaN(expStatusNum) ? proxyData.status === expStatusNum : null;

        const keysArray = expectedKeys
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);

        const keysChecked = keysArray.map((key) => {
          const exists =
            parsedData !== null &&
            typeof parsedData === 'object' &&
            key in parsedData;
          return { key, exists };
        });

        const allKeysPassed =
          keysArray.length > 0
            ? keysChecked.every((k) => k.exists)
            : null;

        let passedCount = 0;
        let failedCount = 0;

        if (statusPassed !== null) {
          if (statusPassed) passedCount++;
          else failedCount++;
        }

        if (allKeysPassed !== null) {
          if (allKeysPassed) passedCount++;
          else failedCount++;
        }

        const meta = {
          status: proxyData.status,
          statusText: proxyData.statusText,
          responseTimeMs: proxyData.timeMs,
          headers: proxyData.headers || {},
          body: proxyData.body,
          statusPassed,
          allKeysPassed,
          keysChecked,
          passedCount,
          failedCount,
          sizeBytes: proxyData.sizeBytes,
        };

        setResponseMeta(meta);

        if (user) {
          try {
            await supabase.from('request_history').insert({
              user_id: user.id,
              method,
              url,
              status: proxyData.status,
              response_time_ms: proxyData.timeMs,
              passed: passedCount,
              failed: failedCount,
            });
          } catch (dbErr) {
            console.warn('[API Sentinel] Could not record request history:', dbErr);
          }
        }
      } catch (proxyFetchErr) {
        setResponseMeta({
          status: 0,
          statusText: 'Proxy Unreachable',
          responseTimeMs: 0,
          headers: {},
          body: `Failed to contact /api/proxy: ${proxyFetchErr.message}`,
          statusPassed: false,
          allKeysPassed: false,
          keysChecked: [],
          passedCount: 0,
          failedCount: 1,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    const options = {
      method,
      headers: parsedHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method) && bodyText.trim()) {
      options.body = bodyText;
    }

    try {
      const res = await fetch(url, options);
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);

      const resHeaders = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      const contentType = res.headers.get('content-type') || '';
      let resBody = '';
      let parsedData = null;

      if (contentType.includes('application/json')) {
        try {
          parsedData = await res.json();
          resBody = JSON.stringify(parsedData, null, 2);
        } catch {
          resBody = await res.text();
        }
      } else {
        resBody = await res.text();
      }

      // Assertions
      const expStatusNum = parseInt(expectedStatus, 10);
      const statusPassed = !isNaN(expStatusNum) ? res.status === expStatusNum : null;

      const keysArray = expectedKeys
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const keysChecked = keysArray.map((key) => {
        const exists =
          parsedData !== null &&
          typeof parsedData === 'object' &&
          key in parsedData;
        return { key, exists };
      });

      const allKeysPassed =
        keysArray.length > 0
          ? keysChecked.every((k) => k.exists)
          : null;

      let passedCount = 0;
      let failedCount = 0;

      if (statusPassed !== null) {
        if (statusPassed) passedCount++;
        else failedCount++;
      }

      if (allKeysPassed !== null) {
        if (allKeysPassed) passedCount++;
        else failedCount++;
      }

      const meta = {
        status: res.status,
        statusText: res.statusText,
        responseTimeMs,
        headers: resHeaders,
        body: resBody,
        statusPassed,
        allKeysPassed,
        keysChecked,
        passedCount,
        failedCount,
      };

      setResponseMeta(meta);

      // Record to history if user is logged in
      if (user) {
        try {
          await supabase.from('request_history').insert({
            user_id: user.id,
            method,
            url,
            status: res.status,
            response_time_ms: responseTimeMs,
            passed: passedCount,
            failed: failedCount,
          });
        } catch (dbErr) {
          console.warn('[API Sentinel] Could not record request history:', dbErr);
        }
      }
    } catch (err) {
      const endTime = performance.now();
      setResponseMeta({
        status: 0,
        statusText: 'Network Error',
        responseTimeMs: Math.round(endTime - startTime),
        headers: {},
        body: `Error: ${err.message || 'Unable to execute request (CORS or network failure)'}`,
        statusPassed: false,
        allKeysPassed: false,
        keysChecked: [],
        passedCount: 0,
        failedCount: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCollections = async () => {
    if (!user) {
      alert('Please sign in to save this request to your collections.');
      return;
    }

    try {
      setSaveStatus('saving');
      let parsedHeaders = {};
      try {
        if (headersJson.trim()) parsedHeaders = JSON.parse(headersJson);
      } catch {
        parsedHeaders = {};
      }

      const expKeys = expectedKeys
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const { error } = await supabase.from('saved_requests').insert({
        user_id: user.id,
        name: requestName || `${method} ${url}`,
        method,
        url,
        headers: parsedHeaders,
        body: bodyText,
        expected_status: parseInt(expectedStatus, 10) || 200,
        expected_keys: expKeys,
      });

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert(`Failed to save: ${err.message}`);
      setSaveStatus('');
    }
  };

  const copyResponse = () => {
    if (responseMeta?.body) {
      navigator.clipboard.writeText(responseMeta.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            API Tester Sandbox
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dispatch HTTP calls, evaluate contract rules, and benchmark response times.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUseProxy(!useProxy)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-300 ${
              useProxy
                ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/80 shadow-sm shadow-indigo-950/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="When active, routes requests via /api/proxy to bypass browser CORS"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                useProxy ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'
              }`}
            ></span>
            <span>{useProxy ? 'Proxy: ON (CORS Bypass)' : 'Direct Browser Fetch'}</span>
          </button>

          {user ? (
            <button
              onClick={handleSaveToCollections}
              disabled={saveStatus === 'saving'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-sm font-medium transition-all duration-300"
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Saved to Collections</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-indigo-400" />
                  <span>Save to Collections</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">
              (Sign in to save request to collections)
            </span>
          )}
        </div>
      </div>

      {/* Main Request Config Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 space-y-4">
        {/* Optional Request Label */}
        {user && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Request Label (for Saved Collections)
            </label>
            <input
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="e.g. Fetch user profile endpoint"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all duration-300"
            />
          </div>
        )}

        {/* Method & URL Bar */}
        <div className="flex flex-col md:flex-row items-stretch gap-2">
          <div className="w-full md:w-36 flex-shrink-0">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={`w-full h-12 px-3 rounded-xl border bg-slate-950 font-bold text-sm tracking-wider outline-none focus:border-indigo-500 transition-all duration-300 ${getMethodBadge(
                method
              )}`}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/v1/resource"
              className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
            />
          </div>

          <button
            onClick={handleSendRequest}
            disabled={loading || !url.trim()}
            className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 flex-shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>

        {/* Request Options Tabs */}
        <div className="pt-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveReqTab('headers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                activeReqTab === 'headers'
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Headers (JSON)
            </button>
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <button
                onClick={() => setActiveReqTab('body')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  activeReqTab === 'body'
                    ? 'bg-slate-800 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Request Body
              </button>
            )}
            <button
              onClick={() => setActiveReqTab('assertions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                activeReqTab === 'assertions'
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Contract Assertions
            </button>
          </div>

          <div className="pt-3">
            {activeReqTab === 'headers' && (
              <div>
                <textarea
                  rows={4}
                  value={headersJson}
                  onChange={(e) => setHeadersJson(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all duration-300"
                  placeholder='{ "Authorization": "Bearer token" }'
                />
              </div>
            )}

            {activeReqTab === 'body' && (
              <div>
                <textarea
                  rows={5}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all duration-300"
                  placeholder='{ "key": "value" }'
                />
              </div>
            )}

            {activeReqTab === 'assertions' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected HTTP Status
                  </label>
                  <input
                    type="number"
                    value={expectedStatus}
                    onChange={(e) => setExpectedStatus(e.target.value)}
                    placeholder="200"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all duration-300"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Passes if the response code equals this value.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected JSON Keys (comma separated)
                  </label>
                  <input
                    type="text"
                    value={expectedKeys}
                    onChange={(e) => setExpectedKeys(e.target.value)}
                    placeholder="id, title, status"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all duration-300"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Validates whether response JSON object includes these property keys.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response & Assertions Display Card */}
      {responseMeta && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  responseMeta.status >= 200 && responseMeta.status < 400
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
                }`}
              >
                Status: {responseMeta.status} {responseMeta.statusText}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{responseMeta.responseTimeMs} ms</span>
              </span>
            </div>

            {/* Assertion Summary Pills */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-800/70">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passed: {responseMeta.passedCount}</span>
              </span>

              {responseMeta.failedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/50 text-rose-400 border border-rose-800/70">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Failed: {responseMeta.failedCount}</span>
                </span>
              )}
            </div>
          </div>

          {/* Assertion Checklist */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contract Validations
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {responseMeta.statusPassed !== null && (
                <div className="flex items-center gap-1.5">
                  {responseMeta.statusPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="text-slate-300">
                    Status Code check (expected {expectedStatus})
                  </span>
                </div>
              )}

              {responseMeta.keysChecked.map((kc) => (
                <div key={kc.key} className="flex items-center gap-1.5">
                  {kc.exists ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="font-mono text-slate-300">
                    Key &ldquo;{kc.key}&rdquo;
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Response Payload Tabs */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveResTab('body')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    activeResTab === 'body'
                      ? 'bg-slate-800 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Response Body
                </button>
                <button
                  onClick={() => setActiveResTab('headers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    activeResTab === 'headers'
                      ? 'bg-slate-800 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Headers ({Object.keys(responseMeta.headers).length})
                </button>
              </div>

              {activeResTab === 'body' && (
                <button
                  onClick={copyResponse}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1 px-2 rounded hover:bg-slate-800 transition-all duration-300"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="pt-3">
              {activeResTab === 'body' ? (
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-96 leading-relaxed">
                  {responseMeta.body || '(empty response)'}
                </pre>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
                  {Object.entries(responseMeta.headers).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-indigo-400 font-semibold">{k}:</span>
                      <span className="text-slate-300 break-all">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
