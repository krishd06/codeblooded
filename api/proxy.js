import dns from 'node:dns/promises';

/**
 * Checks whether an IP address or hostname is localhost or falls within
 * private/link-local/loopback ranges to prevent SSRF vulnerabilities.
 *
 * @param {string} host - Hostname or IP string
 * @returns {boolean} - true if the host is blocked
 */
function isPrivateOrBlocked(host) {
  if (!host) return true;
  const cleanHost = host.toLowerCase().replace(/^\[|\]$/g, '');

  // Exact names and local domains
  if (
    cleanHost === 'localhost' ||
    cleanHost.endsWith('.localhost') ||
    cleanHost.endsWith('.local') ||
    cleanHost === '127.0.0.1' ||
    cleanHost === '0.0.0.0' ||
    cleanHost === '::1' ||
    cleanHost === '0:0:0:0:0:0:0:1' ||
    cleanHost === '::'
  ) {
    return true;
  }

  // IPv4 dotted-decimal range check
  const ipv4Match = cleanHost.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const oct1 = parseInt(ipv4Match[1], 10);
    const oct2 = parseInt(ipv4Match[2], 10);
    const oct3 = parseInt(ipv4Match[3], 10);
    const oct4 = parseInt(ipv4Match[4], 10);

    if (oct1 > 255 || oct2 > 255 || oct3 > 255 || oct4 > 255) {
      return true;
    }

    // Loopback: 127.0.0.0/8
    if (oct1 === 127) return true;

    // Current network / 0.0.0.0/8
    if (oct1 === 0) return true;

    // Private Class A: 10.0.0.0/8 (10.x.x.x)
    if (oct1 === 10) return true;

    // Private Class B: 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
    if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) return true;

    // Private Class C: 192.168.0.0/16 (192.168.x.x)
    if (oct1 === 192 && oct2 === 168) return true;

    // Link-local / Cloud Metadata: 169.254.0.0/16 (169.254.x.x)
    if (oct1 === 169 && oct2 === 254) return true;
  }

  // IPv6 private & local ranges
  if (
    cleanHost.startsWith('fe80:') || // link-local
    cleanHost.startsWith('fc00:') || // unique local address
    cleanHost.startsWith('fd') ||
    cleanHost.includes('::ffff:127.') ||
    cleanHost.includes('::ffff:10.') ||
    cleanHost.includes('::ffff:172.') ||
    cleanHost.includes('::ffff:192.168.') ||
    cleanHost.includes('::ffff:169.254.')
  ) {
    return true;
  }

  return false;
}

/**
 * Universal response helper compatible with Vercel serverless functions (res.status().json())
 * and standard Node/Connect HTTP response objects (res.statusCode / res.end()).
 */
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
  return res;
}

/**
 * Safely parses the incoming request body across Vercel environments and Node streams.
 */
async function getRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return null;
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

/**
 * Vercel Serverless Function: API Proxy
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' });
  }

  const payload = await getRequestBody(req);
  if (!payload || typeof payload !== 'object') {
    return sendJson(res, 400, { error: 'Request body must be a valid JSON object.' });
  }

  const { url, method, headers, body, timeoutMs } = payload;

  // 1. Validate: URL must be valid http or https
  if (!url || typeof url !== 'string') {
    return sendJson(res, 400, { error: 'url must be a valid http or https URL.' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return sendJson(res, 400, { error: 'url must be a valid http or https URL.' });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return sendJson(res, 400, { error: 'url must be a valid http or https URL.' });
  }

  // 1. Validate: Method must be one of GET, POST, PUT, PATCH, DELETE
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const normalizedMethod = (typeof method === 'string' ? method.toUpperCase() : '');
  if (!allowedMethods.includes(normalizedMethod)) {
    return sendJson(res, 400, {
      error: 'method must be one of GET, POST, PUT, PATCH, DELETE.',
    });
  }

  // 2. Security: Block requests to localhost and private network ranges (SSRF prevention)
  if (isPrivateOrBlocked(parsedUrl.hostname)) {
    return sendJson(res, 200, {
      ok: false,
      errorType: 'invalid_url',
      message: 'Requests to localhost and private network ranges are blocked to prevent SSRF.',
    });
  }

  // Verify resolved IP address against SSRF to protect against DNS rebinding
  try {
    const resolved = await dns.lookup(parsedUrl.hostname);
    if (isPrivateOrBlocked(resolved.address)) {
      return sendJson(res, 200, {
        ok: false,
        errorType: 'invalid_url',
        message: 'Requests to localhost and private network ranges are blocked to prevent SSRF.',
      });
    }
  } catch (dnsErr) {
    return sendJson(res, 200, {
      ok: false,
      errorType: 'dns',
      message: `DNS resolution failed for ${parsedUrl.hostname}: ${dnsErr.message || 'Host not found'}`,
    });
  }

  // 3. Timeout configuration (default 10000 ms, max 25000 ms)
  let timeout = parseInt(timeoutMs, 10);
  if (isNaN(timeout) || timeout <= 0) {
    timeout = 10000;
  } else if (timeout > 25000) {
    timeout = 25000;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  // 3. Prepare Fetch Options - do not send a body for GET
  const fetchOptions = {
    method: normalizedMethod,
    headers: headers && typeof headers === 'object' ? headers : {},
    signal: controller.signal,
    redirect: 'follow',
  };

  if (normalizedMethod !== 'GET' && body !== undefined && body !== null && body !== '') {
    fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : String(body);
  }

  try {
    // 4. Measure response time in ms around the fetch
    const startTime = performance.now();
    const upstreamRes = await fetch(parsedUrl.toString(), fetchOptions);
    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    clearTimeout(timeoutId);

    // 5. Read response as text and truncate to 1 MB (1,048,576 bytes)
    const rawText = await upstreamRes.text();
    const MAX_BYTES = 1024 * 1024;
    const rawBuffer = Buffer.from(rawText, 'utf8');
    const sizeBytes = rawBuffer.length;

    let responseBody = rawText;
    if (sizeBytes > MAX_BYTES) {
      responseBody = rawBuffer.subarray(0, MAX_BYTES).toString('utf8');
    }

    // Convert headers to plain object
    const responseHeaders = {};
    upstreamRes.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 6 & 7. Return HTTP 200 with result (4xx and 5xx from target are normal responses)
    return sendJson(res, 200, {
      ok: true,
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
      body: responseBody,
      timeMs,
      sizeBytes,
    });
  } catch (err) {
    clearTimeout(timeoutId);

    let errorType = 'network';
    let message = err.message || 'Upstream request failed.';

    if (err.name === 'AbortError' || controller.signal.aborted) {
      errorType = 'timeout';
      message = `Request timed out after ${timeout} ms`;
    } else if (
      err.code === 'ENOTFOUND' ||
      err.code === 'EAI_AGAIN' ||
      (err.message && err.message.toLowerCase().includes('enotfound'))
    ) {
      errorType = 'dns';
      message = `DNS resolution failed for ${parsedUrl.hostname}`;
    } else if (
      err.code === 'ECONNREFUSED' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT'
    ) {
      errorType = 'network';
      message = `Network connection error (${err.code})`;
    }

    return sendJson(res, 200, {
      ok: false,
      errorType,
      message,
    });
  }
}
