# API Sentinel

**A web-based API testing tool: send HTTP requests, inspect responses, and instantly see whether they meet your expectations.**

---

## Submission Links

| | Link |
|---|---|
| **Live Deployed Application** | [https://codeblooded404.vercel.app ]|
| **Demo Video (YouTube, Unlisted/Public)** | [https://youtu.be/9p8144jiJW8?si=y7gLP0RzOzoOEqfe] |
| **GitHub Repository** | https://github.com/krishd06/codeblooded404 |

---

## Team

**Team Name:** [Coldblooded404]

| # | Member Name | Role |
|---|---|---|
| 1 | [Aryan Kokitkar] | [Frontend] |
| 2 | [Manthan Kamdi] | [Backend and Database] |
| 3 | [Krish DOiphode] | [Testing] |


---

## Project Overview

### Problem
Developers constantly need a quick way to check whether an API works. They want to send a request, read the response, and know whether something is wrong. Doing this by hand is slow, and simple failures such as a wrong status code, broken JSON or a timeout are easy to miss.

### Solution
**API Sentinel** lets a developer type a URL, choose an HTTP method, add headers and a JSON body, and press **Send**. The app shows the status code, response time and response body, then runs a set of validation checks. It reports how many checks **passed** and how many **failed**, with clear error messages when a request cannot be completed.

### Features

| # | Feature | Details |
|---|---|---|
| 1 | **Send HTTP requests** | Supports `GET`, `POST`, `PUT`, `PATCH` and `DELETE` |
| 2 | **Headers and body** | Custom key/value headers and a JSON request body with a formatter and live JSON validation |
| 3 | **View responses** | Color-coded status code, response time (ms), response size, pretty-printed body, and response headers |
| 4 | **Status code validation** | Compares the actual status with the expected status the user sets |
| 5 | **JSON validation** | Checks that the response is valid JSON, that its type is as expected (object or array), that required keys exist, and that the `Content-Type` is JSON |
| 6 | **Test summary** | Shows total checks, passed, failed, and an overall PASS or FAIL result |
| 7 | **Error handling** | Clear messages for invalid URLs, invalid JSON body, timeouts, unreachable hosts and blocked addresses |
| + | **Accounts and history** | Signup and login; request history and saved tests stored per user |
| + | **Export report** | Download the test results as CSV or JSON |

---

## Tech Stack and Justification

| Technology | Used for | Why we chose it |
|---|---|---|
| **React** | User interface | Component-based UI makes the request builder, response viewer and validation panels easy to build and reuse, and it keeps the page responsive as state changes. |
| **Vite** | Build tool and dev server | Very fast start-up and rebuilds, which matters in an 8-hour build, and it produces an optimized static build for deployment. |
| **Tailwind CSS** | Styling | Utility classes give a consistent design system (colors, spacing, dark theme) quickly, without writing and maintaining large CSS files. |
| **Vercel Serverless Function** (`api/proxy.js`) | Backend proxy | Browsers block most cross-origin API calls (CORS), so a pure frontend cannot test real APIs. The proxy makes the call server-side, measures response time, and returns a clean result. It also blocks localhost and private addresses to prevent SSRF. No server to manage. |
| **Supabase (Auth + PostgreSQL)** | Login and storage | Provides secure email/password authentication and a managed database with **Row Level Security**, so each user can only read and write their own history and saved tests. |
| **React Router** | Navigation | Client-side routing between the Tester, History, Collections and Settings pages, with protected routes for logged-in pages. |
| **Lucide React** | Icons | Lightweight, consistent icon set. |
| **GitHub + Vercel** | Source control and hosting | Every push to `main` redeploys automatically, so the live site always matches the repository. |

### Architecture

```
Browser (React + Tailwind)
   │  1. user sets URL, method, headers, body, expected results
   ▼
Vercel Serverless Function  /api/proxy
   │  2. validates input, blocks private addresses, calls the target API,
   │     measures time, returns status / headers / body / errors
   ▼
Target API
   ▲
   │  3. React shows the response and runs validation checks (pure functions)
   ▼
Supabase (optional, logged-in users): Auth + request history + saved tests (RLS enabled)
```

---

## How to Use (Quick Test for Judges)

The **Tester page works without logging in.**

1. Open the live link and click **Try it now** (or go to `/tester`).
2. Choose `GET` and enter `https://jsonplaceholder.typicode.com/posts/1`.
3. Set **Expected status** to `200` and **Expected keys** to `id,title,userId`.
4. Click **Send**. You should see the status, response time, response body, and a test summary with all checks passed.
5. Try a failing case: send `GET https://httpbin.org/status/404` with expected status `200`. The status check fails and the summary shows the failure.
6. Try an error case: send a request to `https://thisdomaindoesnotexist123.com` to see a clear connection error.
7. Try `POST https://jsonplaceholder.typicode.com/posts` with a JSON body and expected status `201`.

Optional: sign up or log in to use **History**, **Collections** and **Settings**.

**Demo login (optional):** `[email]` / `[password]`

---

## Run Locally

### Prerequisites
- Node.js 18 or newer
- A free [Supabase](https://supabase.com) project (only needed for login, history and saved tests)
- Vercel CLI (needed to run the `/api` function locally): `npm install -g vercel`

### Setup

```bash
git clone https://github.com/krishd06/codeblooded404.git
cd codeblooded404
npm install
```

Create a `.env.local` file (you can copy `.env.example`):

```text
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create the database tables: open the Supabase **SQL Editor**, paste the contents of `supabase/schema.sql`, and click **Run**.

In Supabase, go to **Authentication, Sign In / Providers, Email** and turn **off** "Confirm email".

### Start the app

```bash
vercel dev
```

`npm run dev` alone will not run the `/api/proxy` function, so use `vercel dev` for full functionality.

### Build

```bash
npm run build
```

---

## Deployment

The app is deployed on **Vercel** directly from this repository.

1. Import the GitHub repo in Vercel.
2. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy. Every push to `main` triggers an automatic redeploy.
4. In Supabase, set **Authentication, URL Configuration, Site URL** to the Vercel link and add `https://<your-vercel-link>/**` to the Redirect URLs.

`vercel.json` rewrites all routes to `index.html` (excluding `/api/*`), so refreshing any page works.

---

## Project Structure

```
codeblooded404/
├── api/
│   └── proxy.js              # Serverless proxy: performs the request, times it, handles errors
├── src/
│   ├── components/           # Layout, ProtectedRoute
│   ├── context/              # AuthContext (Supabase Auth)
│   ├── lib/                  # validate.js: validation checks
│   ├── pages/                # Landing, Tester, History, Collections, Settings
│   ├── supabaseClient.js     # Supabase client (reads env variables)
│   ├── App.jsx               # Routes
│   └── main.jsx
├── supabase/
│   └── schema.sql            # Tables and Row Level Security policies
├── vercel.json               # SPA rewrites
├── .env.example              # Required environment variables (no secrets)
└── README.md
```

---

## Security Notes

- No secrets are committed. Keys are read from environment variables, and `.env*` is git-ignored (except `.env.example`).
- The Supabase **anon** key is public by design. Data is protected by **Row Level Security** policies on every table.
- The proxy only allows `http` and `https` URLs, enforces a request timeout and a response size limit, and **blocks requests to localhost and private network ranges** (SSRF protection). Because of this, local APIs cannot be tested through the deployed app; use a public URL.

---

## Limitations and Future Work

- APIs that require browser-only credentials or private network access cannot be reached through the proxy.
- Possible next steps: response schema validation, test collections with chained requests, scheduled monitoring, and shareable test reports.

---

## Links Checklist

- [ ] Live link added at the top and opens in an Incognito window
- [ ] Demo video link added (YouTube **Unlisted or Public**, never Private)
- [ ] Team name and all member names filled in
