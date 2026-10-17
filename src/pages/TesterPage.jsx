import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import {
  Play,
  Loader2,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  BookmarkPlus,
  Clock,
  Database,
  AlertCircle,
  FileText,
  Activity,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  Sliders,
  History,
  RotateCcw,
  Timer,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';

// Quick Preset Examples
const QUICK_EXAMPLES = [
  {
    label: 'GET: JSONPlaceholder Post #1',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: [{ id: 1, key: 'Accept', value: 'application/json' }],
    body: '',
    expectedStatus: 200,
    expectedType: 'object',
    expectedKeys: 'id, title, userId',
    maxLatency: 1000,
  },
  {
    label: 'POST: JSONPlaceholder Create Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [{ id: 1, key: 'Content-Type', value: 'application/json; charset=UTF-8' }],
    body: JSON.stringify(
      {
        title: 'API Sentinel Automated Test',
        body: 'Verified payload dispatched via Sentinel workspace runner',
        userId: 1,
      },
      null,
      2
    ),
    expectedStatus: 201,
    expectedType: 'object',
    expectedKeys: 'id, title, userId',
    maxLatency: 1500,
  },
  {
    label: 'PUT: JSONPlaceholder Replace Post #1',
    method: 'PUT',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: [{ id: 1, key: 'Content-Type', value: 'application/json; charset=UTF-8' }],
    body: JSON.stringify(
      {
        id: 1,
        title: 'Updated Post Title via Sentinel',
        body: 'Completely replaced post body text with assertions active',
        userId: 1,
      },
      null,
      2
    ),
    expectedStatus: 200,
    expectedType: 'object',
    expectedKeys: 'id, title, body',
    maxLatency: 1500,
  },
  {
    label: 'PATCH: JSONPlaceholder Update Title #1',
    method: 'PATCH',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: [{ id: 1, key: 'Content-Type', value: 'application/json; charset=UTF-8' }],
    body: JSON.stringify(
      {
        title: 'Partially Patched Sentinel Title',
      },
      null,
      2
    ),
    expectedStatus: 200,
    expectedType: 'object',
    expectedKeys: 'title',
    maxLatency: 1500,
  },
  {
    label: 'DELETE: JSONPlaceholder Delete Post #1',
    method: 'DELETE',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: [{ id: 1, key: 'Accept', value: 'application/json' }],
    body: '',
    expectedStatus: 200,
    expectedType: 'any',
    expectedKeys: '',
    maxLatency: 1000,
  },
  {
    label: 'GET: Httpbin 404 Status Test',
    method: 'GET',
    url: 'https://httpbin.org/status/404',
    headers: [{ id: 1, key: 'Accept', value: 'application/json' }],
    body: '',
    expectedStatus: 404,
    expectedType: 'any',
    expectedKeys: '',
    maxLatency: 2000,
  },
  {
    label: 'GET: DummyJSON Search with Query Params',
    method: 'GET',
    url: 'https://dummyjson.com/products/search?q=phone&limit=3',
    headers: [{ id: 1, key: 'Accept', value: 'application/json' }],
    body: '',
    expectedStatus: 200,
    expectedType: 'object',
    expectedKeys: 'products, total',
    maxLatency: 1200,
  },
];

/**
 * Lightweight syntax highlighter for JSON strings adapting to dark & light themes.
 */
function highlightJson(jsonStr, isDark = true) {
  if (!jsonStr) return '';
  const escaped = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = isDark ? 'text-amber-400 font-mono' : 'text-amber-700 font-mono font-semibold'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = isDark
            ? 'text-purple-300 font-bold font-mono'
            : 'text-[#064e3b] font-bold font-mono'; // key
        } else {
          cls = isDark
            ? 'text-emerald-300 font-mono'
            : 'text-emerald-700 font-mono font-medium'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = isDark
          ? 'text-cyan-400 font-bold font-mono'
          : 'text-teal-700 font-bold font-mono'; // boolean
      } else if (/null/.test(match)) {
        cls = isDark
          ? 'text-slate-400 italic font-mono'
          : 'text-slate-500 italic font-mono'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

/**
 * Parse URL query string into key-value parameter rows
 */
function parseQueryParamsFromUrl(fullUrl) {
  try {
    const parsed = new URL(fullUrl);
    const rows = [];
    let idx = 1;
    parsed.searchParams.forEach((value, key) => {
      rows.push({ id: idx++, key, value, enabled: true });
    });
    return rows.length > 0 ? rows : [{ id: 1, key: '', value: '', enabled: true }];
  } catch {
    return [{ id: 1, key: '', value: '', enabled: true }];
  }
}

/**
 * Reconstruct URL with given parameter rows
 */
function syncUrlWithParams(currentUrl, paramRows) {
  try {
    const parsed = new URL(currentUrl);
    parsed.search = '';
    paramRows.forEach((row) => {
      if (row.enabled && row.key.trim()) {
        parsed.searchParams.append(row.key.trim(), row.value);
      }
    });
    return parsed.toString();
  } catch {
    return currentUrl;
  }
}

export default function TesterPage() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const location = useLocation();

  // Request State
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [requestName, setRequestName] = useState('My Test Request');

  // Config Tabs: 'params' | 'headers' | 'body' | 'auth' | 'validation'
  const [activeConfigTab, setActiveConfigTab] = useState('params');

  // 1. Query Parameters State
  const [paramRows, setParamRows] = useState(() => parseQueryParamsFromUrl(url));
  const isInternalUrlSync = useRef(false);

  // 2. Headers State
  const [headerRows, setHeaderRows] = useState([
    { id: 1, key: 'Content-Type', value: 'application/json', enabled: true },
    { id: 2, key: 'Accept', value: 'application/json', enabled: true },
  ]);

  // 3. Body State
  const [bodyText, setBodyText] = useState(
    '{\n  "title": "Sentinel Test Post",\n  "body": "Automated payload check",\n  "userId": 1\n}'
  );

  // 4. Authorization State
  const [authType, setAuthType] = useState('none'); // 'none' | 'bearer' | 'basic' | 'apikey'
  const [authToken, setAuthToken] = useState('');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');
  const [apiKeyName, setApiKeyName] = useState('x-api-key');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiKeyAddTo, setApiKeyAddTo] = useState('header'); // 'header' | 'query'

  // 5. Automatic Validation & Latency SLA Rules
  const [expectedStatus, setExpectedStatus] = useState('200');
  const [requireValidJson, setRequireValidJson] = useState(true);
  const [structureCheck, setStructureCheck] = useState('any'); // 'any' | 'object' | 'array' | 'keys'
  const [expectedKeys, setExpectedKeys] = useState('id, title');
  const [maxAcceptableLatency, setMaxAcceptableLatency] = useState(1000); // in ms

  // Execution & Response State
  const [loading, setLoading] = useState(false);
  const [responseMeta, setResponseMeta] = useState(null);
  const [activeResTab, setActiveResTab] = useState('body'); // 'body' | 'headers' | 'summary'
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // History Drawer State
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [localHistory, setLocalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_request_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep localStorage history synced
  useEffect(() => {
    try {
      localStorage.setItem('sentinel_request_history', JSON.stringify(localHistory.slice(0, 50)));
    } catch (e) {
      console.warn('Could not persist local history:', e);
    }
  }, [localHistory]);

  // Two-way synchronization: URL changes -> Params table updates
  const handleUrlChange = (newUrl) => {
    setUrl(newUrl);
    if (!isInternalUrlSync.current) {
      const parsed = parseQueryParamsFromUrl(newUrl);
      setParamRows(parsed);
    }
  };

  // Two-way synchronization: Params table changes -> URL updates
  const handleParamsUpdate = (newParams) => {
    setParamRows(newParams);
    isInternalUrlSync.current = true;
    const updatedUrl = syncUrlWithParams(url, newParams);
    setUrl(updatedUrl);
    setTimeout(() => {
      isInternalUrlSync.current = false;
    }, 50);
  };

  // Param Helpers
  const addParamRow = () => {
    handleParamsUpdate([...paramRows, { id: Date.now(), key: '', value: '', enabled: true }]);
  };

  const updateParamRow = (id, field, val) => {
    const updated = paramRows.map((r) => (r.id === id ? { ...r, [field]: val } : r));
    handleParamsUpdate(updated);
  };

  const removeParamRow = (id) => {
    const filtered = paramRows.filter((r) => r.id !== id);
    handleParamsUpdate(filtered.length > 0 ? filtered : [{ id: Date.now(), key: '', value: '', enabled: true }]);
  };

  // Header Helpers
  const addHeaderRow = () => {
    setHeaderRows((prev) => [...prev, { id: Date.now(), key: '', value: '', enabled: true }]);
  };

  const updateHeaderRow = (id, field, val) => {
    setHeaderRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const removeHeaderRow = (id) => {
    setHeaderRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.length > 0 ? filtered : [{ id: Date.now(), key: '', value: '', enabled: true }];
    });
  };

  // Handle Prefill from Collections navigation or History
  useEffect(() => {
    if (location.state?.prefill) {
      loadRequestData(location.state.prefill);
    }
  }, [location.state]);

  const loadRequestData = (data) => {
    if (data.method) setMethod(data.method);
    if (data.url) {
      setUrl(data.url);
      setParamRows(parseQueryParamsFromUrl(data.url));
    }
    if (data.name) setRequestName(data.name);
    if (data.body) {
      setBodyText(typeof data.body === 'string' ? data.body : JSON.stringify(data.body, null, 2));
    }
    if (data.headers && typeof data.headers === 'object') {
      const rows = Object.entries(data.headers).map(([k, v], idx) => ({
        id: idx + 1,
        key: k,
        value: String(v),
        enabled: true,
      }));
      if (rows.length > 0) setHeaderRows(rows);
    }
    if (data.expected_status || data.expectedStatus) {
      setExpectedStatus(String(data.expected_status || data.expectedStatus));
    }
    if (data.expected_keys || data.expectedKeys) {
      const keys = Array.isArray(data.expected_keys)
        ? data.expected_keys.join(', ')
        : data.expectedKeys;
      setExpectedKeys(keys || '');
      if (keys) setStructureCheck('keys');
    }
    if (data.maxLatency) setMaxAcceptableLatency(Number(data.maxLatency));
  };

  // Body JSON Validation
  const bodyJsonError = useMemo(() => {
    if (!['POST', 'PUT', 'PATCH'].includes(method)) return null;
    if (!bodyText.trim()) return null;
    try {
      JSON.parse(bodyText);
      return null;
    } catch (err) {
      return err.message;
    }
  }, [method, bodyText]);

  // Format JSON Handler
  const handleFormatJson = () => {
    if (!bodyText.trim()) return;
    try {
      const parsed = JSON.parse(bodyText);
      setBodyText(JSON.stringify(parsed, null, 2));
    } catch (err) {
      alert(`Cannot format JSON: ${err.message}`);
    }
  };

  // Quick Examples Handler
  const handleSelectExample = (e) => {
    const selected = QUICK_EXAMPLES.find((ex) => ex.label === e.target.value);
    if (!selected) return;

    setMethod(selected.method);
    setUrl(selected.url);
    setParamRows(parseQueryParamsFromUrl(selected.url));
    setHeaderRows(
      selected.headers.map((h, i) => ({ id: i + 1, key: h.key, value: h.value, enabled: true }))
    );
    if (selected.body) setBodyText(selected.body);
    if (selected.expectedStatus) setExpectedStatus(String(selected.expectedStatus));
    if (selected.expectedType) setStructureCheck(selected.expectedType);
    if (selected.expectedKeys) setExpectedKeys(selected.expectedKeys);
    if (selected.maxLatency) setMaxAcceptableLatency(selected.maxLatency);

    if (['POST', 'PUT', 'PATCH'].includes(selected.method)) {
      setActiveConfigTab('body');
    } else if (selected.url.includes('?')) {
      setActiveConfigTab('params');
    } else {
      setActiveConfigTab('headers');
    }
  };

  // Build Final Headers including Authorization
  const buildFinalHeaders = () => {
    const headersObj = {};
    headerRows.forEach((row) => {
      if (row.enabled && row.key.trim()) {
        headersObj[row.key.trim()] = row.value;
      }
    });

    if (authType === 'bearer' && authToken.trim()) {
      headersObj['Authorization'] = `Bearer ${authToken.trim()}`;
    } else if (authType === 'basic' && (basicUser || basicPass)) {
      try {
        const encoded = btoa(`${basicUser}:${basicPass}`);
        headersObj['Authorization'] = `Basic ${encoded}`;
      } catch {
        // fallback
      }
    } else if (authType === 'apikey' && apiKeyAddTo === 'header' && apiKeyName.trim() && apiKeyValue) {
      headersObj[apiKeyName.trim()] = apiKeyValue;
    }

    return headersObj;
  };

  // Build Final URL including API Key query param if configured
  const buildFinalUrl = () => {
    let finalUrl = url.trim();
    if (authType === 'apikey' && apiKeyAddTo === 'query' && apiKeyName.trim() && apiKeyValue) {
      try {
        const u = new URL(finalUrl);
        u.searchParams.set(apiKeyName.trim(), apiKeyValue);
        finalUrl = u.toString();
      } catch {
        // fallback
      }
    }
    return finalUrl;
  };

  // Run Test Validations against response
  const evaluateValidationRules = (status, timeMs, bodyStr) => {
    const checks = [];

    // 1. Status Code Check
    const targetStatus = parseInt(expectedStatus, 10);
    if (!isNaN(targetStatus) && targetStatus > 0) {
      const passed = status === targetStatus;
      checks.push({
        id: 'status',
        name: `HTTP Status Code matches ${targetStatus}`,
        passed,
        details: passed
          ? `Expected ${targetStatus}, received ${status}`
          : `Expected ${targetStatus}, but received status code ${status}`,
      });
    }

    // 2. Valid JSON Check
    let parsedBody = null;
    let isJson = false;
    try {
      parsedBody = JSON.parse(bodyStr);
      isJson = true;
    } catch {
      isJson = false;
    }

    if (requireValidJson) {
      checks.push({
        id: 'json',
        name: 'Response body is valid JSON',
        passed: isJson,
        details: isJson
          ? 'Successfully parsed JSON body without errors'
          : 'Response body is not valid JSON or was empty',
      });
    }

    // 3. Structure Check
    if (structureCheck === 'object') {
      const isObj = isJson && parsedBody !== null && typeof parsedBody === 'object' && !Array.isArray(parsedBody);
      checks.push({
        id: 'structure-object',
        name: 'Response root is a JSON Object ({})',
        passed: isObj,
        details: isObj ? 'Root element is a valid JSON Object' : 'Root element is not an Object',
      });
    } else if (structureCheck === 'array') {
      const isArr = isJson && Array.isArray(parsedBody);
      checks.push({
        id: 'structure-array',
        name: 'Response root is a JSON Array ([])',
        passed: isArr,
        details: isArr ? `Root element is an array with ${parsedBody?.length || 0} items` : 'Root element is not an Array',
      });
    } else if (structureCheck === 'keys') {
      const required = expectedKeys
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      if (required.length > 0) {
        if (!isJson || !parsedBody || typeof parsedBody !== 'object') {
          checks.push({
            id: 'structure-keys',
            name: `Required keys present: [${required.join(', ')}]`,
            passed: false,
            details: 'Response is not a JSON object containing keys',
          });
        } else {
          const sampleObj = Array.isArray(parsedBody) ? parsedBody[0] || {} : parsedBody;
          const missing = required.filter((k) => !(k in sampleObj));
          const passed = missing.length === 0;
          checks.push({
            id: 'structure-keys',
            name: `Required keys present: [${required.join(', ')}]`,
            passed,
            details: passed
              ? `All ${required.length} required keys verified`
              : `Missing required key(s): ${missing.join(', ')}`,
          });
        }
      }
    }

    // 4. Response Time SLA Check
    if (maxAcceptableLatency > 0) {
      const passed = timeMs <= maxAcceptableLatency;
      checks.push({
        id: 'latency',
        name: `Response time <= ${maxAcceptableLatency} ms (SLA)`,
        passed,
        details: passed
          ? `Latency was ${timeMs} ms (well within ${maxAcceptableLatency} ms threshold)`
          : `Latency was ${timeMs} ms, exceeding threshold of ${maxAcceptableLatency} ms`,
      });
    }

    const totalPassed = checks.filter((c) => c.passed).length;
    const totalFailed = checks.filter((c) => !c.passed).length;

    return {
      checks,
      totalPassed,
      totalFailed,
      totalChecks: checks.length,
      allPassed: checks.length > 0 && totalFailed === 0,
    };
  };

  // Main Send Request Handler
  const handleSendRequest = async () => {
    const finalUrl = buildFinalUrl();
    if (!finalUrl || bodyJsonError) return;

    setLoading(true);
    setSaveStatus('');
    const finalHeaders = buildFinalHeaders();

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: finalUrl,
          method,
          headers: finalHeaders,
          body: ['POST', 'PUT', 'PATCH'].includes(method) ? bodyText : undefined,
          timeoutMs: 15000,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        const valResults = evaluateValidationRules(data.status, data.timeMs || 0, data.body || '');

        const meta = {
          ok: true,
          status: data.status,
          statusText: data.statusText || 'OK',
          headers: data.headers || {},
          body: data.body || '',
          timeMs: data.timeMs || 0,
          sizeBytes: data.sizeBytes || 0,
          validation: valResults,
        };
        setResponseMeta(meta);

        // Record into local history
        const historyItem = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          method,
          url: finalUrl,
          status: data.status,
          timeMs: data.timeMs || 0,
          passed: valResults.totalPassed,
          failed: valResults.totalFailed,
          allPassed: valResults.allPassed,
          headers: finalHeaders,
          body: bodyText,
        };
        setLocalHistory((prev) => [historyItem, ...prev]);

        // Record in Supabase if logged in
        if (user) {
          try {
            await supabase.from('request_history').insert({
              user_id: user.id,
              method,
              url: finalUrl,
              status: data.status,
              response_time_ms: data.timeMs,
              passed: valResults.totalPassed,
              failed: valResults.totalFailed,
            });
          } catch (dbErr) {
            console.warn('[API Sentinel] Could not record request history in Supabase:', dbErr);
          }
        }
      } else {
        const valResults = evaluateValidationRules(0, 0, '');
        const meta = {
          ok: false,
          status: 0,
          statusText: data.errorType ? `Error: ${data.errorType}` : 'Request Failed',
          headers: {},
          body: `Proxy Error (${data.errorType || 'network'}):\n${data.message || 'Target server unreachable'}`,
          timeMs: 0,
          sizeBytes: 0,
          validation: valResults,
        };
        setResponseMeta(meta);
      }
    } catch (err) {
      const valResults = evaluateValidationRules(0, 0, '');
      setResponseMeta({
        ok: false,
        status: 0,
        statusText: 'Proxy Unreachable',
        headers: {},
        body: `Local proxy connection error:\n${err.message}`,
        timeMs: 0,
        sizeBytes: 0,
        validation: valResults,
      });
    } finally {
      setLoading(false);
    }
  };

  // Save to collections handler
  const handleSaveToCollections = async () => {
    if (!user) {
      alert('Please sign in to save this request to your Supabase collections.');
      return;
    }

    try {
      setSaveStatus('saving');
      const finalHeaders = buildFinalHeaders();
      const expKeysArr = expectedKeys
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const { error } = await supabase.from('saved_requests').insert({
        user_id: user.id,
        name: requestName || `${method} ${url}`,
        method,
        url: url.trim(),
        headers: finalHeaders,
        body: ['POST', 'PUT', 'PATCH'].includes(method) ? bodyText : null,
        expected_status: parseInt(expectedStatus, 10) || 200,
        expected_keys: expKeysArr,
      });

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
      setSaveStatus('');
    }
  };

  // Copy response body
  const copyResponse = () => {
    if (responseMeta?.body) {
      navigator.clipboard.writeText(responseMeta.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Method Colors (Theme-aware)
  const getMethodBadgeClass = (m) => {
    if (!isDark) {
      switch (m) {
        case 'GET':
          return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'POST':
          return 'bg-teal-100 text-teal-800 border-teal-300';
        case 'PUT':
          return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'PATCH':
          return 'bg-cyan-100 text-cyan-800 border-cyan-300';
        case 'DELETE':
          return 'bg-rose-100 text-rose-800 border-rose-300';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-300';
      }
    }
    switch (m) {
      case 'GET':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
      case 'POST':
        return 'bg-purple-950/60 text-purple-400 border-purple-800/80';
      case 'PUT':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/80';
      case 'PATCH':
        return 'bg-cyan-950/60 text-cyan-400 border-cyan-800/80';
      case 'DELETE':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/80';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  // Status Badge Style (Theme-aware)
  const getStatusBadgeStyle = (code) => {
    if (!isDark) {
      if (code >= 200 && code < 300) {
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      }
      if (code >= 300 && code < 400) {
        return 'bg-blue-100 text-blue-800 border-blue-300';
      }
      if (code >= 400 && code < 500) {
        return 'bg-amber-100 text-amber-800 border-amber-300';
      }
      if (code >= 500) {
        return 'bg-rose-100 text-rose-800 border-rose-300';
      }
      return 'bg-slate-100 text-slate-700 border-slate-300';
    }
    if (code >= 200 && code < 300) {
      return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80';
    }
    if (code >= 300 && code < 400) {
      return 'bg-blue-950/70 text-blue-400 border-blue-800/80';
    }
    if (code >= 400 && code < 500) {
      return 'bg-amber-950/70 text-amber-400 border-amber-800/80';
    }
    if (code >= 500) {
      return 'bg-rose-950/70 text-rose-400 border-rose-800/80';
    }
    return 'bg-slate-900 text-slate-400 border-slate-800';
  };

  // Highlighted JSON Body
  const formattedResponseBody = useMemo(() => {
    if (!responseMeta?.body) return '';
    try {
      const parsed = JSON.parse(responseMeta.body);
      const pretty = JSON.stringify(parsed, null, 2);
      return highlightJson(pretty, isDark);
    } catch {
      return null;
    }
  }, [responseMeta, isDark]);

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);

  return (
    <div className="space-y-6">
      {/* Top Workspace Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-mono font-bold text-xs shadow-md ${
              isDark
                ? 'bg-purple-600 shadow-purple-600/30'
                : 'bg-emerald-700 shadow-emerald-700/20'
            }`}>
              {'{ }'}
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-[#064e3b]'
            }`}>
              API Testing Workspace
            </h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              isDark
                ? 'bg-purple-950/70 text-purple-300 border-purple-700/50'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              Live Runner
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-purple-200/70' : 'text-emerald-800/80 font-medium'}`}>
            Dispatch real HTTP requests, configure query params &amp; headers, benchmark latency, and execute automated validation checks.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* History Drawer Toggle Button */}
          <button
            onClick={() => setHistoryDrawerOpen(!historyDrawerOpen)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 ${
              isDark
                ? 'bg-[#141033] hover:bg-[#1a1542] text-slate-200 border border-purple-500/30'
                : 'bg-white hover:bg-emerald-50 text-[#064e3b] border border-emerald-200'
            }`}
            title="View recent execution history"
          >
            <History className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`} />
            <span>History ({localHistory.length})</span>
          </button>

          {/* Save to Supabase Collections Button */}
          {user ? (
            <button
              onClick={handleSaveToCollections}
              disabled={saveStatus === 'saving'}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-200 ${
                isDark
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
              }`}
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved to Collections</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-white" />
                  <span>Save Request</span>
                </>
              )}
            </button>
          ) : (
            <span className={`text-xs italic hidden md:inline ${isDark ? 'text-purple-300/60' : 'text-emerald-700/80 font-medium'}`}>
              (Sign in to sync suites to Supabase)
            </span>
          )}
        </div>
      </div>

      {/* RECENT REQUESTS HISTORY DRAWER / BAR */}
      {historyDrawerOpen && (
        <div className={`border rounded-2xl p-4 shadow-xl transition-all duration-300 space-y-3 ${
          isDark
            ? 'bg-[#0c0924] border-purple-500/30 shadow-purple-950/40'
            : 'bg-white border-emerald-200 shadow-emerald-950/5'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
            <div className="flex items-center gap-2">
              <History className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`} />
              <h2 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                Recent Request History (Click to Reload)
              </h2>
            </div>
            {localHistory.length > 0 && (
              <button
                onClick={() => setLocalHistory([])}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold"
              >
                Clear History
              </button>
            )}
          </div>

          {localHistory.length === 0 ? (
            <p className={`text-xs py-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              No recent requests yet. Run an API request below to start building your execution timeline.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {localHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadRequestData(item)}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between gap-1.5 group ${
                    isDark
                      ? 'bg-[#141033]/60 hover:bg-[#1a1542] border-purple-500/20 hover:border-purple-400'
                      : 'bg-emerald-50/50 hover:bg-emerald-100/60 border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getMethodBadgeClass(
                        item.method
                      )}`}
                    >
                      {item.method}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                        item.status
                      )}`}
                    >
                      {item.status || 'ERR'}
                    </span>
                  </div>
                  <div className={`text-xs font-mono truncate font-medium ${
                    isDark ? 'text-slate-200 group-hover:text-purple-300' : 'text-[#064e3b] group-hover:text-emerald-700 font-semibold'
                  }`}>
                    {item.url}
                  </div>
                  <div className={`flex items-center justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>{item.timeMs} ms</span>
                    <span className="flex items-center gap-1 font-semibold">
                      {item.allPassed ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Passed
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> {item.passed}/{item.passed + item.failed}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Two-Column Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT-HAND REQUEST PANEL (lg:col-span-6) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className={`p-5 rounded-2xl shadow-xl space-y-4 transition-all duration-300 ${
            isDark
              ? 'purple-card bg-[#0c0924] border border-purple-500/30'
              : 'bg-white border border-emerald-200/80 shadow-emerald-950/5'
          }`}>
            {/* Quick Examples Selector */}
            <div className={`flex items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
              <label className={`text-xs font-bold flex items-center gap-1.5 flex-shrink-0 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`} />
                <span>Quick Examples:</span>
              </label>
              <select
                onChange={handleSelectExample}
                defaultValue=""
                className={`w-full max-w-xs px-3 py-1.5 rounded-xl border text-xs font-medium outline-none transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400 focus:bg-[#1a1542]'
                    : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] focus:border-emerald-500 focus:bg-white'
                }`}
              >
                <option value="" disabled>
                  Select a preconfigured template...
                </option>
                {QUICK_EXAMPLES.map((ex) => (
                  <option key={ex.label} value={ex.label}>
                    {ex.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Request Label for saving to collections */}
            {user && (
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-[#064e3b]'}`}>
                  Request Label (for Saved Collections)
                </label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="e.g. Fetch user profile endpoint"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none transition-all duration-200 ${
                    isDark
                      ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400 focus:bg-[#1a1542]'
                      : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] placeholder:text-emerald-800/40 focus:border-emerald-500 focus:bg-white'
                  }`}
                />
              </div>
            )}

            {/* Method Dropdown & URL Input with Send Button */}
            <div className="space-y-2">
              <label className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#064e3b]'}`}>
                Endpoint &amp; Method
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                {/* Method Dropdown */}
                <div className="w-full sm:w-28 flex-shrink-0">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className={`w-full h-11 px-3 rounded-xl border font-mono font-bold text-xs tracking-wider outline-none transition-all duration-200 cursor-pointer ${getMethodBadgeClass(
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

                {/* URL Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className={`w-full h-11 px-3.5 rounded-xl border font-mono text-xs outline-none transition-all duration-200 ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/30 text-white placeholder-slate-500 focus:border-purple-400 focus:bg-[#1a1542]'
                        : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] placeholder:text-emerald-800/40 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendRequest}
                  disabled={loading || Boolean(bodyJsonError) || !url.trim()}
                  className={`h-11 px-6 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-white ${
                    isDark
                      ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
                  }`}
                  title={bodyJsonError ? 'Cannot send: invalid JSON body' : 'Send HTTP Request'}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Request Configuration Tabs */}
            <div className="pt-2">
              {/* Tab Navigation */}
              <div className={`flex flex-wrap items-center justify-between border-b pb-2 gap-2 ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Params Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveConfigTab('params')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      activeConfigTab === 'params'
                        ? isDark
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-[#064e3b] hover:text-[#022c22] hover:bg-emerald-100/60 font-semibold'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Params ({paramRows.filter((r) => r.key.trim() && r.enabled).length})</span>
                  </button>

                  {/* Headers Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveConfigTab('headers')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      activeConfigTab === 'headers'
                        ? isDark
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-[#064e3b] hover:text-[#022c22] hover:bg-emerald-100/60 font-semibold'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Headers ({headerRows.filter((r) => r.key.trim() && r.enabled).length})</span>
                  </button>

                  {/* Body Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveConfigTab('body')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      activeConfigTab === 'body'
                        ? isDark
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-[#064e3b] hover:text-[#022c22] hover:bg-emerald-100/60 font-semibold'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Body</span>
                    {hasBody && bodyJsonError && (
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    )}
                  </button>

                  {/* Authorization Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveConfigTab('auth')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      activeConfigTab === 'auth'
                        ? isDark
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-[#064e3b] hover:text-[#022c22] hover:bg-emerald-100/60 font-semibold'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Auth {authType !== 'none' ? `(${authType})` : ''}</span>
                  </button>

                  {/* Validation Rules Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveConfigTab('validation')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      activeConfigTab === 'validation'
                        ? isDark
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-[#064e3b] hover:text-[#022c22] hover:bg-emerald-100/60 font-semibold'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Validation &amp; SLA</span>
                  </button>
                </div>

                {/* Sub Tab Action: Format JSON in body tab */}
                {activeConfigTab === 'body' && hasBody && (
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 border ${
                      isDark
                        ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                    }`}
                    title="Format JSON indentation"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Format JSON</span>
                  </button>
                )}
              </div>

              {/* TAB 1: PARAMS (Query Parameters with 2-way URL sync) */}
              {activeConfigTab === 'params' && (
                <div className="pt-3 space-y-2">
                  <div className={`flex items-center justify-between text-[11px] px-1 font-semibold ${isDark ? 'text-purple-200/60' : 'text-emerald-800/80'}`}>
                    <span>Query parameters automatically synchronize with URL</span>
                    <span>{paramRows.filter((r) => r.key.trim() && r.enabled).length} Active</span>
                  </div>

                  <div className="space-y-2">
                    {paramRows.map((row) => (
                      <div key={row.id} className="flex items-center gap-2">
                        {/* Enabled checkbox */}
                        <button
                          type="button"
                          onClick={() => updateParamRow(row.id, 'enabled', !row.enabled)}
                          className={`p-1 ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                          title={row.enabled ? 'Disable parameter' : 'Enable parameter'}
                        >
                          {row.enabled ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 opacity-50" />
                          )}
                        </button>

                        <input
                          type="text"
                          value={row.key}
                          onChange={(e) => updateParamRow(row.id, 'key', e.target.value)}
                          placeholder="Parameter Key (e.g. limit)"
                          className={`flex-1 px-3 py-2 rounded-xl border font-mono text-xs outline-none transition-all duration-200 ${
                            isDark
                              ? 'bg-[#141033] border-purple-500/30 text-white placeholder-slate-500 focus:border-purple-400 focus:bg-[#1a1542]'
                              : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] placeholder:text-emerald-800/40 focus:border-emerald-500 focus:bg-white'
                          } ${!row.enabled ? 'opacity-40 line-through' : ''}`}
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => updateParamRow(row.id, 'value', e.target.value)}
                          placeholder="Value (e.g. 10)"
                          className={`flex-1 px-3 py-2 rounded-xl border font-mono text-xs outline-none transition-all duration-200 ${
                            isDark
                              ? 'bg-[#141033] border-purple-500/30 text-white placeholder-slate-500 focus:border-purple-400 focus:bg-[#1a1542]'
                              : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] placeholder:text-emerald-800/40 focus:border-emerald-500 focus:bg-white'
                          } ${!row.enabled ? 'opacity-40' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeParamRow(row.id)}
                          className={`p-2 rounded-xl border transition-all duration-200 ${
                            isDark
                              ? 'bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-white/10'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                          }`}
                          title="Remove parameter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addParamRow}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 mt-2 border ${
                      isDark
                        ? 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border-purple-700/40'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-[#064e3b] border-emerald-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Parameter</span>
                  </button>
                </div>
              )}

              {/* TAB 2: HEADERS */}
              {activeConfigTab === 'headers' && (
                <div className="pt-3 space-y-2">
                  <div className="space-y-2">
                    {headerRows.map((row) => (
                      <div key={row.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateHeaderRow(row.id, 'enabled', !row.enabled)}
                          className={`p-1 ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                          title={row.enabled ? 'Disable header' : 'Enable header'}
                        >
                          {row.enabled ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 opacity-50" />
                          )}
                        </button>

                        <input
                          type="text"
                          value={row.key}
                          onChange={(e) => updateHeaderRow(row.id, 'key', e.target.value)}
                          placeholder="Header (e.g. Content-Type)"
                          className={`flex-1 px-3 py-2 rounded-xl border font-mono text-xs outline-none transition-all duration-200 ${
                            isDark
                              ? 'bg-[#141033] border-purple-500/30 text-white placeholder-slate-500 focus:border-purple-400 focus:bg-[#1a1542]'
                              : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] placeholder:text-emerald-800/40 focus:border-emerald-500 focus:bg-white'
                          } ${!row.enabled ? 'opacity-40 line-through' : ''}`}
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => updateHeaderRow(row.id, 'value', e.target.value)}
                          placeholder="Value (e.g. application/json)"
                          className={`flex-1 px-3 py-2 rounded-xl border font-mono text-xs outline-none transition-all duration-200 ${
                            isDark
                              ? 'bg-[#141033] border-purple-500/30 text-white placeholder-slate-500 focus:border-purple-400 focus:bg-[#1a1542]'
                              : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] placeholder:text-emerald-800/40 focus:border-emerald-500 focus:bg-white'
                          } ${!row.enabled ? 'opacity-40' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeHeaderRow(row.id)}
                          className={`p-2 rounded-xl border transition-all duration-200 ${
                            isDark
                              ? 'bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-white/10'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                          }`}
                          title="Remove header"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addHeaderRow}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 mt-2 border ${
                      isDark
                        ? 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border-purple-700/40'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-[#064e3b] border-emerald-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Header</span>
                  </button>
                </div>
              )}

              {/* TAB 3: BODY */}
              {activeConfigTab === 'body' && (
                <div className="pt-3 space-y-2">
                  {!hasBody ? (
                    <div className={`p-4 rounded-xl border text-xs space-y-1 ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/20 text-slate-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                        HTTP {method} requests typically do not contain a body payload.
                      </p>
                      <p>
                        To send JSON payloads, switch HTTP method to <strong>POST</strong>, <strong>PUT</strong>, or <strong>PATCH</strong> above.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <textarea
                          rows={8}
                          value={bodyText}
                          onChange={(e) => setBodyText(e.target.value)}
                          placeholder='{\n  "key": "value"\n}'
                          className={`w-full p-3.5 rounded-xl border font-mono text-xs outline-none transition-all duration-200 leading-relaxed ${
                            bodyJsonError
                              ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : isDark
                              ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400 focus:bg-[#1a1542]'
                              : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] focus:border-emerald-500 focus:bg-white'
                          }`}
                        />
                      </div>

                      {bodyJsonError ? (
                        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Invalid JSON Syntax:</span>{' '}
                            <span>{bodyJsonError}</span>
                            <div className="text-[11px] text-rose-400 mt-0.5">
                              Please correct the syntax error. Request sending is paused until resolved.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-[11px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          Valid JSON payload syntax detected. Ready to dispatch.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: AUTHORIZATION */}
              {activeConfigTab === 'auth' && (
                <div className="pt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <label className={`text-xs font-bold w-24 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                      Auth Type:
                    </label>
                    <select
                      value={authType}
                      onChange={(e) => setAuthType(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none ${
                        isDark
                          ? 'bg-[#141033] border-purple-500/30 text-white focus:border-purple-400'
                          : 'bg-[#f4f8f6] border-emerald-300 text-[#022c22] focus:border-emerald-500'
                      }`}
                    >
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="apikey">API Key</option>
                    </select>
                  </div>

                  {authType === 'none' && (
                    <p className={`text-xs p-3 rounded-xl border ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/20 text-slate-400'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                    }`}>
                      This request does not include any authorization credentials.
                    </p>
                  )}

                  {authType === 'bearer' && (
                    <div className={`space-y-1.5 p-3 rounded-xl border ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/20'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}>
                      <label className={`block text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                        Bearer Token
                      </label>
                      <input
                        type="text"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                          isDark
                            ? 'bg-[#08061a] border-purple-500/30 text-white focus:border-purple-400'
                            : 'bg-white border-emerald-300 text-[#022c22] focus:border-emerald-500'
                        }`}
                      />
                      <p className={`text-[11px] ${isDark ? 'text-purple-300/70' : 'text-emerald-700/80 font-medium'}`}>
                        Injected as header: <code className={`font-mono ${isDark ? 'text-purple-400' : 'text-emerald-800 font-bold'}`}>Authorization: Bearer &lt;token&gt;</code>
                      </p>
                    </div>
                  )}

                  {authType === 'basic' && (
                    <div className={`space-y-2 p-3 rounded-xl border ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/20'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                            Username
                          </label>
                          <input
                            type="text"
                            value={basicUser}
                            onChange={(e) => setBasicUser(e.target.value)}
                            placeholder="admin"
                            className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                              isDark
                                ? 'bg-[#08061a] border-purple-500/30 text-white focus:border-purple-400'
                                : 'bg-white border-emerald-300 text-[#022c22] focus:border-emerald-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                            Password
                          </label>
                          <input
                            type="password"
                            value={basicPass}
                            onChange={(e) => setBasicPass(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                              isDark
                                ? 'bg-[#08061a] border-purple-500/30 text-white focus:border-purple-400'
                                : 'bg-white border-emerald-300 text-[#022c22] focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-purple-300/70' : 'text-emerald-700/80 font-medium'}`}>
                        Injected as header: <code className={`font-mono ${isDark ? 'text-purple-400' : 'text-emerald-800 font-bold'}`}>Authorization: Basic &lt;base64&gt;</code>
                      </p>
                    </div>
                  )}

                  {authType === 'apikey' && (
                    <div className={`space-y-2 p-3 rounded-xl border ${
                      isDark
                        ? 'bg-[#141033] border-purple-500/20'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                            Key Name
                          </label>
                          <input
                            type="text"
                            value={apiKeyName}
                            onChange={(e) => setApiKeyName(e.target.value)}
                            placeholder="x-api-key"
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                              isDark
                                ? 'bg-[#08061a] border-purple-500/30 text-white focus:border-purple-400'
                                : 'bg-white border-emerald-300 text-[#022c22] focus:border-emerald-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                            Key Value
                          </label>
                          <input
                            type="text"
                            value={apiKeyValue}
                            onChange={(e) => setApiKeyValue(e.target.value)}
                            placeholder="live_sec_..."
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                              isDark
                                ? 'bg-[#08061a] border-purple-500/30 text-white focus:border-purple-400'
                                : 'bg-white border-emerald-300 text-[#022c22] focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-[#064e3b]'}`}>Add To:</span>
                        <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${isDark ? 'text-slate-300' : 'text-emerald-950 font-medium'}`}>
                          <input
                            type="radio"
                            name="apiKeyAddTo"
                            checked={apiKeyAddTo === 'header'}
                            onChange={() => setApiKeyAddTo('header')}
                          />
                          <span>Header</span>
                        </label>
                        <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${isDark ? 'text-slate-300' : 'text-emerald-950 font-medium'}`}>
                          <input
                            type="radio"
                            name="apiKeyAddTo"
                            checked={apiKeyAddTo === 'query'}
                            onChange={() => setApiKeyAddTo('query')}
                          />
                          <span>Query Params</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: AUTOMATIC VALIDATION & LATENCY MONITORING */}
              {activeConfigTab === 'validation' && (
                <div className="pt-3 space-y-4">
                  <div className={`p-3.5 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#141033] border-purple-500/20' : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`} />
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                        Response Validation Contract
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Expected Status Code */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                          Expected Status Code
                        </label>
                        <input
                          type="number"
                          value={expectedStatus}
                          onChange={(e) => setExpectedStatus(e.target.value)}
                          placeholder="200"
                          className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono font-bold outline-none ${
                            isDark
                              ? 'bg-[#08061a] border-purple-500/30 text-white focus:border-purple-400'
                              : 'bg-white border-emerald-300 text-[#022c22] focus:border-emerald-500'
                          }`}
                        />
                      </div>

                      {/* Require Valid JSON */}
                      <div className="flex flex-col justify-center">
                        <label className={`text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                          JSON Syntax Assertion
                        </label>
                        <label className={`flex items-center gap-2 text-xs cursor-pointer select-none ${isDark ? 'text-slate-300' : 'text-emerald-950 font-medium'}`}>
                          <input
                            type="checkbox"
                            checked={requireValidJson}
                            onChange={(e) => setRequireValidJson(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Require valid JSON body</span>
                        </label>
                      </div>
                    </div>

                    {/* Response Structure Assertion */}
                    <div className={`space-y-1.5 pt-1 border-t ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
                      <label className={`block text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                        Response Structure Check
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'any', label: 'Any Structure' },
                          { id: 'object', label: 'Object ({})' },
                          { id: 'array', label: 'Array ([])' },
                          { id: 'keys', label: 'Required Keys' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setStructureCheck(item.id)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              structureCheck === item.id
                                ? isDark
                                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/40'
                                  : 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-800/20'
                                : isDark
                                ? 'bg-[#08061a] text-slate-300 border-purple-500/20 hover:bg-[#1a1542]'
                                : 'bg-white text-[#064e3b] border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {structureCheck === 'keys' && (
                        <div className="pt-1.5">
                          <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-[#064e3b]'}`}>
                            Required Keys (comma-separated):
                          </label>
                          <input
                            type="text"
                            value={expectedKeys}
                            onChange={(e) => setExpectedKeys(e.target.value)}
                            placeholder="id, title, status"
                            className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-none ${
                              isDark
                                ? 'bg-[#08061a] border-purple-500/30 text-white focus:border-purple-400'
                                : 'bg-white border-emerald-300 text-[#022c22] focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Response-Time Monitoring (Latency SLA) */}
                  <div className={`p-3.5 rounded-xl border space-y-2 ${
                    isDark ? 'bg-[#141033] border-purple-500/20' : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                          Response-Time Monitoring (Max SLA)
                        </h3>
                      </div>
                      <span className={`text-xs font-mono font-bold ${isDark ? 'text-purple-400' : 'text-emerald-700'}`}>
                        {maxAcceptableLatency} ms
                      </span>
                    </div>

                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Flag warnings and fail validation tests if the target API takes longer than this maximum acceptable threshold.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="50"
                        step="50"
                        value={maxAcceptableLatency}
                        onChange={(e) => setMaxAcceptableLatency(Number(e.target.value))}
                        className={`w-28 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold outline-none ${
                          isDark
                            ? 'bg-[#08061a] border-purple-500/30 text-white focus:border-purple-400'
                            : 'bg-white border-emerald-300 text-[#022c22] focus:border-emerald-500'
                        }`}
                      />
                      <div className="flex items-center gap-1.5">
                        {[200, 500, 1000, 2000].map((ms) => (
                          <button
                            key={ms}
                            type="button"
                            onClick={() => setMaxAcceptableLatency(ms)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              maxAcceptableLatency === ms
                                ? isDark
                                  ? 'bg-purple-600 text-white border-purple-500'
                                  : 'bg-emerald-600 text-white border-emerald-600'
                                : isDark
                                ? 'bg-[#08061a] text-slate-300 border-purple-500/20 hover:bg-[#1a1542]'
                                : 'bg-white text-[#064e3b] border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {ms}ms
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT-HAND RESPONSE PANEL (lg:col-span-6) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className={`p-5 rounded-2xl shadow-xl min-h-[480px] flex flex-col transition-all duration-300 ${
            isDark
              ? 'purple-card bg-[#0c0924] border border-purple-500/30'
              : 'bg-white border border-emerald-200/80 shadow-emerald-950/5'
          }`}>
            {/* Header: Response Title & Status Badges */}
            <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-[#064e3b]'}`}>
                  Response Viewer &amp; Inspector
                </span>
              </div>

              {/* Status Badges & Metrics */}
              {!loading && responseMeta && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                      responseMeta.status
                    )}`}
                  >
                    {responseMeta.status} {responseMeta.statusText}
                  </span>

                  {/* Response Time Badge with SLA status */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      responseMeta.timeMs <= maxAcceptableLatency
                        ? isDark
                          ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        : isDark
                        ? 'bg-amber-950/70 text-amber-400 border-amber-800/80'
                        : 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                    }`}
                    title={`Max acceptable SLA: ${maxAcceptableLatency} ms`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{responseMeta.timeMs} ms</span>
                  </span>

                  {/* Size Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border font-mono ${
                    isDark
                      ? 'bg-[#141033] text-slate-200 border-purple-500/20'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    <Database className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-emerald-700'}`} />
                    <span>
                      {responseMeta.sizeBytes
                        ? (responseMeta.sizeBytes / 1024).toFixed(2)
                        : '0.00'}{' '}
                      KB
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* SKELETON LOADER STATE */}
            {loading && (
              <div className="py-12 space-y-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-28 rounded-full animate-pulse ${isDark ? 'bg-purple-900/30' : 'bg-emerald-200'}`}></div>
                  <div className={`h-7 w-20 rounded-full animate-pulse ${isDark ? 'bg-purple-900/30' : 'bg-emerald-200'}`}></div>
                  <div className={`h-7 w-20 rounded-full animate-pulse ${isDark ? 'bg-purple-900/30' : 'bg-emerald-200'}`}></div>
                </div>

                <div className={`p-4 rounded-xl border space-y-3 flex-1 ${
                  isDark ? 'bg-[#08061a] border-purple-500/20' : 'bg-emerald-50/50 border-emerald-200'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-purple-400' : 'text-emerald-600'}`} />
                    <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                      Executing request via Vercel proxy runner...
                    </span>
                  </div>
                  <div className={`h-4 rounded w-11/12 animate-pulse ${isDark ? 'bg-purple-900/20' : 'bg-emerald-100'}`}></div>
                  <div className={`h-4 rounded w-4/5 animate-pulse ${isDark ? 'bg-purple-900/20' : 'bg-emerald-100'}`}></div>
                  <div className={`h-4 rounded w-2/3 animate-pulse ${isDark ? 'bg-purple-900/20' : 'bg-emerald-100'}`}></div>
                  <div className={`h-4 rounded w-5/6 animate-pulse ${isDark ? 'bg-purple-900/20' : 'bg-emerald-100'}`}></div>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !responseMeta && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-inner ${
                  isDark
                    ? 'bg-[#141033] border-purple-500/30 text-purple-400'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}>
                  <Activity className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    No Request Sent Yet
                  </h3>
                  <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                    Configure your method, endpoint, headers, and body on the left panel, or pick a Quick Example above and click <span className={`font-bold ${isDark ? 'text-purple-400' : 'text-emerald-700'}`}>&ldquo;Send&rdquo;</span>.
                  </p>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold ${
                  isDark
                    ? 'bg-purple-950/70 border-purple-700/50 text-purple-300'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Direct Serverless Proxy Ready at /api/proxy</span>
                </div>
              </div>
            )}

            {/* POPULATED RESPONSE VIEW */}
            {!loading && responseMeta && (
              <div className="pt-3 flex-1 flex flex-col">
                {/* Response Tabs: Body, Headers, Test Summary */}
                <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-purple-500/20' : 'border-emerald-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveResTab('body')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        activeResTab === 'body'
                          ? isDark
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                            : 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-white/5'
                          : 'text-[#064e3b] hover:bg-emerald-100/60 font-semibold'
                      }`}
                    >
                      Response Body
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveResTab('headers')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        activeResTab === 'headers'
                          ? isDark
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                            : 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-white/5'
                          : 'text-[#064e3b] hover:bg-emerald-100/60 font-semibold'
                      }`}
                    >
                      Headers ({Object.keys(responseMeta.headers || {}).length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveResTab('summary')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        activeResTab === 'summary'
                          ? isDark
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                            : 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-white/5'
                          : 'text-[#064e3b] hover:bg-emerald-100/60 font-semibold'
                      }`}
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-purple-300' : 'text-emerald-700'}`} />
                      <span>Test Summary</span>
                      {responseMeta.validation && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            responseMeta.validation.allPassed
                              ? isDark
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isDark
                              ? 'bg-rose-950 text-rose-300 border border-rose-700/60'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {responseMeta.validation.totalPassed}/{responseMeta.validation.totalChecks}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Copy Button */}
                  {activeResTab === 'body' && (
                    <button
                      type="button"
                      onClick={copyResponse}
                      className={`inline-flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg border transition-all duration-200 font-semibold ${
                        isDark
                          ? 'bg-[#141033] hover:bg-[#1a1542] text-slate-300 hover:text-white border-purple-500/20'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* TAB 1: RESPONSE BODY */}
                {activeResTab === 'body' && (
                  <div className="pt-3 flex-1 flex flex-col">
                    {formattedResponseBody ? (
                      <pre
                        dangerouslySetInnerHTML={{ __html: formattedResponseBody }}
                        className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-[480px] leading-relaxed flex-1 select-text ${
                          isDark
                            ? 'bg-[#08061a] border-purple-500/20 text-slate-200'
                            : 'bg-[#f8faf9] border-emerald-200 text-[#022c22]'
                        }`}
                      />
                    ) : (
                      <pre className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-[480px] leading-relaxed flex-1 select-text whitespace-pre-wrap ${
                        isDark
                          ? 'bg-[#08061a] border-purple-500/20 text-slate-200'
                          : 'bg-[#f8faf9] border-emerald-200 text-[#022c22]'
                      }`}>
                        {responseMeta.body || '(empty response)'}
                      </pre>
                    )}
                  </div>
                )}

                {/* TAB 2: HEADERS TABLE */}
                {activeResTab === 'headers' && (
                  <div className="pt-3 flex-1">
                    {Object.keys(responseMeta.headers || {}).length === 0 ? (
                      <div className={`p-6 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        No response headers returned.
                      </div>
                    ) : (
                      <div className={`rounded-xl border overflow-hidden max-h-[480px] overflow-y-auto ${
                        isDark
                          ? 'border-purple-500/20 bg-[#08061a]'
                          : 'border-emerald-200 bg-white'
                      }`}>
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className={`border-b ${
                              isDark
                                ? 'border-purple-500/20 bg-[#141033] text-slate-300'
                                : 'border-emerald-200 bg-emerald-100/70 text-[#064e3b]'
                            }`}>
                              <th className="py-2.5 px-3.5 font-bold w-1/3">Header Key</th>
                              <th className="py-2.5 px-3.5 font-bold">Value</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y font-mono ${isDark ? 'divide-purple-500/10' : 'divide-emerald-100'}`}>
                            {Object.entries(responseMeta.headers).map(([key, val]) => (
                              <tr key={key} className={isDark ? 'hover:bg-white/5' : 'hover:bg-emerald-50/60'}>
                                <td className={`py-2 px-3.5 font-semibold break-all ${isDark ? 'text-purple-300' : 'text-emerald-800'}`}>
                                  {key}
                                </td>
                                <td className={`py-2 px-3.5 break-all ${isDark ? 'text-slate-300' : 'text-[#022c22]'}`}>
                                  {val}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: TEST SUMMARY (Automatic Validation & SLA Results) */}
                {activeResTab === 'summary' && (
                  <div className="pt-3 flex-1 space-y-4">
                    {responseMeta.validation ? (
                      <div className="space-y-4">
                        {/* Overall Result Banner */}
                        <div
                          className={`p-4 rounded-xl border flex items-center justify-between ${
                            responseMeta.validation.allPassed
                              ? isDark
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                                : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                              : isDark
                              ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                              : 'bg-rose-100 border-rose-300 text-rose-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                responseMeta.validation.allPassed ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            >
                              {responseMeta.validation.allPassed ? (
                                <Check className="w-6 h-6" />
                              ) : (
                                <AlertCircle className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold">
                                {responseMeta.validation.allPassed
                                  ? 'All Automated Checks Passed!'
                                  : 'Validation Assertions Failed'}
                              </h4>
                              <p className="text-xs opacity-85">
                                {responseMeta.validation.totalPassed} passed,{' '}
                                {responseMeta.validation.totalFailed} failed out of{' '}
                                {responseMeta.validation.totalChecks} total criteria
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 border border-current">
                              {responseMeta.validation.allPassed ? 'VERIFIED SLA' : 'FAILED'}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Checks List */}
                        <div className="space-y-2">
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#064e3b]'}`}>
                            Assertion Checklist
                          </h4>

                          {responseMeta.validation.checks.map((check) => (
                            <div
                              key={check.id}
                              className={`p-3 rounded-xl border flex items-start gap-3 transition-all duration-200 ${
                                check.passed
                                  ? isDark
                                    ? 'bg-[#141033] border-purple-500/20'
                                    : 'bg-emerald-50/60 border-emerald-200'
                                  : isDark
                                  ? 'bg-rose-950/30 border-rose-800/40'
                                  : 'bg-rose-50/60 border-rose-200'
                              }`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {check.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-500" />
                                )}
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-bold ${
                                      check.passed
                                        ? isDark
                                          ? 'text-white'
                                          : 'text-[#064e3b]'
                                        : 'text-rose-600'
                                    }`}
                                  >
                                    {check.name}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      check.passed
                                        ? isDark
                                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : isDark
                                        ? 'bg-rose-950 text-rose-400 border border-rose-800/80'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                                    }`}
                                  >
                                    {check.passed ? 'PASSED' : 'FAILED'}
                                  </span>
                                </div>
                                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {check.details}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        No validation metrics computed.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
