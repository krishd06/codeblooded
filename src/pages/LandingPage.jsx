import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
  AlertCircle,
  FolderGit2,
  Play,
  Settings,
  Eye,
  ShieldCheck,
  FileText,
  CloudUpload,
  Link2,
  Rocket,
  Globe,
  LineChart,
  Check,
  Sparkles,
  Layers,
  Terminal,
  Activity,
  ChevronRight,
  Search,
  Plus,
  Home,
  Users,
  Cloud,
  Moon,
  Sun,
  Folder,
  FileCode,
} from 'lucide-react';

export default function LandingPage() {
  const { user, openAuthModal } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="space-y-32 pb-24 relative overflow-hidden transition-colors duration-300">
      {/* ========================================================================= */}
      {/* HERO SECTION WITH EXACT KONG INSOMNIA COLOR TRANSITION & DESIGN */}
      {/* ========================================================================= */}
      <section className="relative pt-4 pb-16 w-full text-center overflow-visible">
        {/* Full-width radiant background transition matching active theme */}
        <div
          className="absolute inset-x-0 -top-24 w-full h-[1100px] pointer-events-none -z-20 transition-all duration-300"
          style={{
            background: isDark
              ? `
                radial-gradient(ellipse 95% 58% at 50% 64%, rgba(37, 99, 235, 0.85) 0%, rgba(29, 78, 216, 0.6) 28%, rgba(15, 23, 42, 0.4) 55%, transparent 76%),
                linear-gradient(180deg, #000000 0%, #000000 30%, #020617 42%, #0b193d 54%, #0f2766 66%, #0b193d 80%, #020617 92%, #000000 100%)
              `
              : `
                radial-gradient(ellipse 95% 58% at 50% 64%, rgba(52, 211, 153, 0.55) 0%, rgba(16, 185, 129, 0.35) 28%, rgba(5, 150, 105, 0.14) 55%, transparent 76%),
                linear-gradient(180deg, #f4f8f6 0%, #f4f8f6 30%, #ecfdf5 42%, #d1fae5 54%, #a7f3d0 66%, #d1fae5 80%, #ecfdf5 92%, #f4f8f6 100%)
              `,
          }}
        ></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          {/* Top Announcement Pill */}
          <div
            className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-md border text-xs sm:text-[13px] font-medium shadow-md transition-all duration-200 cursor-pointer group ${
              isDark
                ? 'bg-[#172554] hover:bg-[#1e3a8a] border-blue-500/30 text-white shadow-blue-950/50'
                : 'bg-[#064e3b] hover:bg-[#065f46] border-emerald-400/50 text-[#a7f3d0] shadow-emerald-900/10'
            }`}
          >
            <span>Announcing Kong Insomnia 10 GA with unlimited Collection Runner for testing APIs and the new AI Runner GenAI infrastructure offering</span>
            <span
              className={`font-bold group-hover:translate-x-1 transition-transform inline-block ${
                isDark ? 'text-blue-200' : 'text-emerald-200'
              }`}
            >
              →
            </span>
          </div>

          {/* Hero Title - 2-line layout */}
          <div className="space-y-3 pt-2">
            <h1
              className={`text-3xl sm:text-5xl md:text-[52px] lg:text-[56px] font-extrabold tracking-tight leading-[1.14] max-w-4xl mx-auto ${
                isDark ? 'text-white' : 'text-[#022c22]'
              }`}
            >
              Design, debug, test, and mock<br className="hidden sm:inline" /> APIs locally, on Git, or cloud
            </h1>

            {/* Hero Subtitle */}
            <p
              className={`text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal pt-1 ${
                isDark ? 'text-[#bfdbfe]' : 'text-[#065f46]'
              }`}
            >
              Build better APIs collaboratively for the most popular protocols with a dev-friendly UI, built-in
              automation, and an extensible plugin ecosystem.
            </p>
          </div>

          {/* Centered CTA Button */}
          <div className="pt-2 flex items-center justify-center gap-4">
            {user ? (
              <Link
                to="/tester"
                className={`px-6 py-2.5 rounded-md font-bold text-sm shadow-md transition-all duration-200 active:scale-[0.98] ${
                  isDark
                    ? 'bg-white hover:bg-slate-100 text-[#091e42] shadow-black/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/25'
                }`}
              >
                Open API Workspace
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className={`px-6 py-2.5 rounded-md font-bold text-sm shadow-md transition-all duration-200 active:scale-[0.98] ${
                  isDark
                    ? 'bg-white hover:bg-slate-100 text-[#091e42] shadow-black/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/25'
                }`}
              >
                Get Started for Free
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DASHBOARD SHOWCASE WITH RADIATING CURVED RAYS */}
        {/* ========================================================================= */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative">
          
          {/* Glowing Curved Laser Ray Lines */}
          <div className="absolute inset-x-0 -top-16 bottom-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden">
            <svg
              className="w-full h-[620px] min-w-[1100px] max-w-[1400px]"
              viewBox="0 0 1280 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="cometStreak" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity="0" />
                  <stop offset="40%" stopColor="#22c55e" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#a3e635" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Left Fan of Curved Laser Rays */}
              <g opacity={isDark ? 0.92 : 0.85}>
                <path d="M 300 240 C 200 220, 80 160, 0 120" stroke={isDark ? '#60a5fa' : '#6ee7b7'} strokeWidth="1" opacity="0.4" />
                <path d="M 300 260 C 190 245, 70 190, 0 160" stroke={isDark ? '#3b82f6' : '#34d399'} strokeWidth="1.1" opacity="0.5" />
                <path d="M 300 280 C 180 270, 60 220, 0 200" stroke={isDark ? '#2563eb' : '#10b981'} strokeWidth="1.2" opacity="0.6" />
                <path d="M 300 300 C 170 295, 50 250, 0 240" stroke={isDark ? '#1d4ed8' : '#059669'} strokeWidth="1.3" opacity="0.65" />
                <path d="M 300 320 C 160 320, 40 285, 0 280" stroke={isDark ? '#2563eb' : '#047857'} strokeWidth="1.4" opacity="0.75" />
                <path d="M 300 340 C 150 350, 30 325, 0 325" stroke={isDark ? '#1e40af' : '#065f46'} strokeWidth="1.5" opacity="0.8" />
                <path d="M 300 365 C 140 385, 20 375, 0 380" stroke={isDark ? '#2563eb' : '#059669'} strokeWidth="1.6" opacity="0.85" />
                <path d="M 300 390 C 130 425, 10 435, 0 445" stroke={isDark ? '#0284c7' : '#10b981'} strokeWidth="1.8" opacity="0.9" />
                {/* Distinct Lower Reddish/Pink Arc */}
                <path d="M 300 415 C 120 470, 5 495, 0 510" stroke={isDark ? '#ff2a5f' : '#e11d48'} strokeWidth="2.5" opacity="0.95" />
              </g>

              {/* Right Fan of Curved Laser Rays */}
              <g opacity={isDark ? 0.94 : 0.88}>
                <path d="M 980 240 C 1080 220, 1200 160, 1280 120" stroke={isDark ? '#60a5fa' : '#6ee7b7'} strokeWidth="1" opacity="0.4" />
                <path d="M 980 260 C 1090 245, 1210 190, 1280 160" stroke={isDark ? '#3b82f6' : '#34d399'} strokeWidth="1.1" opacity="0.5" />
                <path d="M 980 280 C 1100 270, 1220 220, 1280 200" stroke={isDark ? '#2563eb' : '#10b981'} strokeWidth="1.2" opacity="0.6" />
                <path d="M 980 300 C 1110 295, 1230 250, 1280 240" stroke={isDark ? '#1d4ed8' : '#059669'} strokeWidth="1.3" opacity="0.65" />
                <path d="M 980 320 C 1120 320, 1240 285, 1280 280" stroke={isDark ? '#2563eb' : '#047857'} strokeWidth="1.4" opacity="0.75" />
                <path d="M 980 340 C 1130 350, 1250 325, 1280 325" stroke={isDark ? '#1e40af' : '#065f46'} strokeWidth="1.5" opacity="0.8" />
                <path d="M 980 365 C 1140 385, 1260 375, 1280 380" stroke={isDark ? '#2563eb' : '#059669'} strokeWidth="1.6" opacity="0.85" />
                <path d="M 980 390 C 1150 425, 1270 435, 1280 445" stroke={isDark ? '#3b82f6' : '#10b981'} strokeWidth="1.8" opacity="0.9" />
                <path d="M 980 415 C 1160 470, 1275 495, 1280 510" stroke={isDark ? '#1d4ed8' : '#34d399'} strokeWidth="1.9" opacity="0.9" />

                {/* Glowing Shooting Comet / Meteor with Neon-Green Head */}
                <path
                  d="M 1160 340 C 1200 335, 1240 330, 1278 325"
                  stroke="url(#cometStreak)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.95"
                />
                <g transform="translate(1185, 337)">
                  <circle cx="0" cy="0" r="16" fill={isDark ? '#60a5fa' : '#34d399'} opacity="0.55" filter="url(#glowEffect)" />
                  <circle cx="0" cy="0" r="6" fill="#4ade80" />
                  <circle cx="0" cy="0" r="3" fill="#ffffff" />
                </g>
              </g>
            </svg>
          </div>

          {/* Central Mockup Interface Card matching the reference image layout */}
          <div
            className={`rounded-xl border shadow-2xl overflow-hidden text-left max-w-4xl mx-auto transition-all duration-300 ${
              isDark
                ? 'border-[#1e293b] bg-[#0c1222] shadow-blue-950/90'
                : 'border-[#a7f3d0] bg-white shadow-emerald-950/15'
            }`}
          >
            {/* Mock Top Toolbar */}
            <div
              className={`flex items-center justify-between px-3.5 py-2.5 border-b text-xs transition-colors duration-200 ${
                isDark
                  ? 'bg-[#0f172a] border-[#1e293b] text-slate-200'
                  : 'bg-[#f0fdf4] border-[#d1fae5] text-[#064e3b]'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="API Sentinel Logo"
                  className="w-5 h-5 rounded-full object-contain shadow-sm bg-black/90 p-0.5 border border-emerald-500/20"
                />
                <div
                  className={`flex items-center gap-1 font-semibold cursor-pointer ${
                    isDark ? 'text-slate-200 hover:text-white' : 'text-[#064e3b] hover:text-emerald-800'
                  }`}
                >
                  <span>Kong Org</span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-emerald-700'}`}>⌵</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-emerald-700'}`} />
                  <input
                    type="text"
                    readOnly
                    placeholder="Filter..."
                    className={`w-40 sm:w-56 pl-8 pr-2.5 py-1 rounded border text-[11px] outline-none ${
                      isDark
                        ? 'bg-[#0f0f12] border-[#2b2b34] text-slate-300 placeholder:text-slate-500'
                        : 'bg-white border-[#bbf7d0] text-emerald-950 placeholder:text-emerald-700/60'
                    }`}
                  />
                </div>
                <Link
                  to="/tester"
                  className={`px-2.5 py-1 rounded border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isDark
                      ? 'bg-[#1e293b] hover:bg-[#334155] border-[#334155] text-slate-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Create</span>
                </Link>
                <div className="w-5 h-5 rounded-full bg-blue-700 text-[10px] text-white font-bold flex items-center justify-center">
                  👤
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-white text-[10px] font-bold shadow-sm ${
                    isDark ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}
                >
                  Upgrade
                </span>
              </div>
            </div>

            {/* Split Mock Body: Left Mini Rail + Sidebar + Right Tiles Grid */}
            <div className="grid grid-cols-12 min-h-[380px]">
              {/* Leftmost Mini Icon Rail */}
              <div
                className={`col-span-1 sm:col-span-1 border-r py-3 flex flex-col items-center justify-between ${
                  isDark
                    ? 'bg-[#0b1120] border-[#1e293b] text-slate-400'
                    : 'bg-[#ecfdf5] border-[#d1fae5] text-emerald-800'
                }`}
              >
                <div className="flex flex-col items-center gap-3.5">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                      isDark ? 'bg-blue-600/30 text-blue-300' : 'bg-emerald-600/20 text-emerald-900'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center cursor-pointer">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center cursor-pointer">
                    <Cloud className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  {/* Theme Switcher inside Mockup Rail */}
                  <div
                    onClick={toggleTheme}
                    title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                    className="w-6 h-6 rounded-md hover:bg-black/10 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {isDark ? <Moon className="w-3.5 h-3.5 text-blue-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <div className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Left Sub-Sidebar */}
              <div
                className={`col-span-3 sm:col-span-3 border-r p-3 text-xs space-y-4 ${
                  isDark
                    ? 'bg-[#0f172a] border-[#1e293b] text-slate-400'
                    : 'bg-[#f7fcf9] border-[#d1fae5] text-emerald-900'
                }`}
              >
                <div className="space-y-1">
                  <div
                    className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-emerald-800'
                    }`}
                  >
                    <span>PROJECTS (2)</span>
                    <div className="flex items-center gap-1">
                      <Search className="w-2.5 h-2.5 cursor-pointer" />
                      <Plus className="w-2.5 h-2.5 cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-0.5 pt-1">
                    <div
                      className={`px-2 py-1 rounded font-medium flex items-center gap-2 ${
                        isDark ? 'bg-[#1e293b] text-white' : 'bg-emerald-100 text-[#064e3b]'
                      }`}
                    >
                      <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-emerald-700'}`} />
                      <span>Konnect</span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded flex items-center gap-2 cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-emerald-800 hover:text-emerald-950'
                      }`}
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>On Premise</span>
                    </div>
                  </div>
                </div>

                <div className={`space-y-1 pt-2 border-t ${isDark ? 'border-[#1e293b]' : 'border-[#d1fae5]'}`}>
                  <div
                    className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-emerald-800'
                    }`}
                  >
                    <span>All Files (6)</span>
                  </div>
                  <div className={`space-y-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-emerald-800'}`}>
                    <div
                      className={`px-2 py-1 rounded flex items-center justify-between ${
                        isDark ? 'text-white bg-white/5' : 'text-[#064e3b] bg-emerald-100/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Folder className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-emerald-700'}`} /> Collections (2)
                      </span>
                      <span>+</span>
                    </div>
                    <div className="px-2 py-1 rounded flex items-center justify-between hover:opacity-80 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <FileCode className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-teal-700'}`} /> Design Specs (4)
                      </span>
                      <span>+</span>
                    </div>
                    <div className="px-2 py-1 rounded flex items-center justify-between hover:opacity-80 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Terminal className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} /> Mocks (0)
                      </span>
                      <span>+</span>
                    </div>
                    <div className="px-2 py-1 rounded flex items-center justify-between hover:opacity-80 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Tests (0)
                      </span>
                      <span>+</span>
                    </div>
                    <div className="px-2 py-1 rounded flex items-center justify-between hover:opacity-80 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5" /> Environments (0)
                      </span>
                      <span>+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Tiles Grid */}
              <div className={`col-span-8 sm:col-span-8 p-4 space-y-3 ${isDark ? 'bg-[#080d1a]' : 'bg-[#f4fbf6]'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tile 1 */}
                  <Link
                    to="/tester"
                    className={`p-3 rounded-lg border transition-colors space-y-2 group block ${
                      isDark
                        ? 'bg-[#0f172a] border-[#1e293b] hover:border-blue-500/50'
                        : 'bg-white border-[#d1fae5] hover:border-emerald-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> Document
                      </span>
                      <span className="text-slate-400 text-[10px]">•••</span>
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isDark ? 'text-white group-hover:text-blue-300' : 'text-[#064e3b] group-hover:text-emerald-700'
                        }`}
                      >
                        Cloud OS Login
                      </h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>v2.8.4</p>
                    </div>
                    <div
                      className={`text-[10px] pt-1 border-t flex items-center justify-between ${
                        isDark ? 'border-[#1e293b] text-slate-400' : 'border-[#d1fae5] text-emerald-800/70'
                      }`}
                    >
                      <span>Open API</span>
                      <span>2 hours ago</span>
                    </div>
                  </Link>

                  {/* Tile 2 */}
                  <Link
                    to="/tester"
                    className={`p-3 rounded-lg border transition-colors space-y-2 group block ${
                      isDark
                        ? 'bg-[#0f172a] border-[#1e293b] hover:border-blue-500/50'
                        : 'bg-white border-[#d1fae5] hover:border-emerald-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                          isDark
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <Layers className="w-2.5 h-2.5" /> Collection
                      </span>
                      <span className="text-slate-400 text-[10px]">•••</span>
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isDark ? 'text-white group-hover:text-blue-300' : 'text-[#064e3b] group-hover:text-emerald-700'
                        }`}
                      >
                        Google Play Partner
                      </h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>v1.1</p>
                    </div>
                    <div
                      className={`text-[10px] pt-1 border-t flex items-center justify-between ${
                        isDark ? 'border-[#1e293b] text-slate-400' : 'border-[#d1fae5] text-emerald-800/70'
                      }`}
                    >
                      <span>feat/new-paths</span>
                      <span>2 hours ago</span>
                    </div>
                  </Link>

                  {/* Tile 3 */}
                  <Link
                    to="/tester"
                    className={`p-3 rounded-lg border transition-colors space-y-2 group block ${
                      isDark
                        ? 'bg-[#0f172a] border-[#1e293b] hover:border-blue-500/50'
                        : 'bg-white border-[#d1fae5] hover:border-emerald-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> Document
                      </span>
                      <span className="text-slate-400 text-[10px]">•••</span>
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isDark ? 'text-white group-hover:text-blue-300' : 'text-[#064e3b] group-hover:text-emerald-700'
                        }`}
                      >
                        Cloud OS Login
                      </h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>v2.8.4</p>
                    </div>
                    <div
                      className={`text-[10px] pt-1 border-t flex items-center justify-between ${
                        isDark ? 'border-[#1e293b] text-slate-400' : 'border-[#d1fae5] text-emerald-800/70'
                      }`}
                    >
                      <span>Open API</span>
                      <span>2 hours ago</span>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tile 4 */}
                  <Link
                    to="/tester"
                    className={`p-3 rounded-lg border transition-colors space-y-2 group block ${
                      isDark
                        ? 'bg-[#0f172a] border-[#1e293b] hover:border-blue-500/50'
                        : 'bg-white border-[#d1fae5] hover:border-emerald-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> Document
                      </span>
                      <span className="text-slate-400 text-[10px]">•••</span>
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isDark ? 'text-white group-hover:text-blue-300' : 'text-[#064e3b] group-hover:text-emerald-700'
                        }`}
                      >
                        Cloud OS Login
                      </h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>v2.8.4</p>
                    </div>
                    <div
                      className={`text-[10px] pt-1 border-t flex items-center justify-between ${
                        isDark ? 'border-[#1e293b] text-slate-400' : 'border-[#d1fae5] text-emerald-800/70'
                      }`}
                    >
                      <span>Open API</span>
                      <span>2 hours ago</span>
                    </div>
                  </Link>

                  {/* Tile 5 */}
                  <Link
                    to="/tester"
                    className={`p-3 rounded-lg border transition-colors space-y-2 group block ${
                      isDark
                        ? 'bg-[#0f172a] border-[#1e293b] hover:border-blue-500/50'
                        : 'bg-white border-[#d1fae5] hover:border-emerald-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                          isDark
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <Layers className="w-2.5 h-2.5" /> Collection
                      </span>
                      <span className="text-slate-400 text-[10px]">•••</span>
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isDark ? 'text-white group-hover:text-blue-300' : 'text-[#064e3b] group-hover:text-emerald-700'
                        }`}
                      >
                        Google Play Partner
                      </h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>v1.1</p>
                    </div>
                    <div
                      className={`text-[10px] pt-1 border-t flex items-center justify-between ${
                        isDark ? 'border-[#1e293b] text-slate-400' : 'border-[#d1fae5] text-emerald-800/70'
                      }`}
                    >
                      <span>feat/new-paths</span>
                      <span>2 hours ago</span>
                    </div>
                  </Link>

                  {/* Tile 6 */}
                  <Link
                    to="/tester"
                    className={`p-3 rounded-lg border transition-colors space-y-2 group block ${
                      isDark
                        ? 'bg-[#0f172a] border-[#1e293b] hover:border-blue-500/50'
                        : 'bg-white border-[#d1fae5] hover:border-emerald-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> Document
                      </span>
                      <span className="text-slate-400 text-[10px]">•••</span>
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isDark ? 'text-white group-hover:text-blue-300' : 'text-[#064e3b] group-hover:text-emerald-700'
                        }`}
                      >
                        Cloud OS Login
                      </h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>v2.8.4</p>
                    </div>
                    <div
                      className={`text-[10px] pt-1 border-t flex items-center justify-between ${
                        isDark ? 'border-[#1e293b] text-slate-400' : 'border-[#d1fae5] text-emerald-800/70'
                      }`}
                    >
                      <span>Open API</span>
                      <span>2 hours ago</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: KEY FEATURES (Scrollable, styled with dark blue & glass / light emerald) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 mb-1">
            <img
              src="/logo.png"
              alt="API Sentinel Logo"
              className="w-7 h-7 rounded-lg object-contain shadow-md bg-black/90 p-0.5 border border-emerald-500/20"
            />
            <span
              className={`font-extrabold text-2xl tracking-tight ${
                isDark ? 'text-white' : 'text-[#064e3b]'
              }`}
            >
              API Sentinel
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className={`w-8 h-0.5 ${isDark ? 'bg-blue-500/40' : 'bg-emerald-500/40'}`}></span>
            <h2
              className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-blue-400' : 'text-emerald-700'
              }`}
            >
              Key Features
            </h2>
            <span className={`w-8 h-0.5 ${isDark ? 'bg-blue-500/40' : 'bg-emerald-500/40'}`}></span>
          </div>

          <p
            className={`text-xs font-semibold tracking-wide uppercase ${
              isDark ? 'text-blue-200/70' : 'text-emerald-800/80'
            }`}
          >
            Test • Validate • Build Better APIs
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="purple-card p-6 rounded-2xl space-y-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              }`}
            >
              <Zap className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
              Send HTTP Requests
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
              }`}
            >
              Support multiple HTTP methods like GET, POST, PUT, PATCH and DELETE. Add the target URL,
              headers and request body, and send your request with a single click.
            </p>
          </div>

          {/* Card 2 */}
          <div className="purple-card p-6 rounded-2xl space-y-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              }`}
            >
              <Settings className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
              Configure Headers and Body
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
              }`}
            >
              Add custom headers and send request body (e.g., JSON, form data, or raw text) to test
              APIs with different scenarios and payloads.
            </p>
          </div>

          {/* Card 3 */}
          <div className="purple-card p-6 rounded-2xl space-y-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              }`}
            >
              <Eye className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
              View API Responses
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
              }`}
            >
              Display status codes, response time, headers and response body in a clean and readable
              format. Easily inspect the data returned by the API.
            </p>
          </div>

          {/* Card 4 */}
          <div className="purple-card p-6 rounded-2xl space-y-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
              Automatic Validation
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
              }`}
            >
              Automatically verify the response with expected status code, check for valid JSON, and
              validate the response structure (e.g., object or array). Get instant pass/fail results.
            </p>
          </div>

          {/* Card 5 */}
          <div className="purple-card p-6 rounded-2xl space-y-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
              Test History &amp; Reports
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
              }`}
            >
              Save your test results and view detailed reports including status, response time, checks
              passed/failed and error messages. Track your API performance over time.
            </p>
          </div>

          {/* Card 6 */}
          <div className="purple-card p-6 rounded-2xl space-y-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              }`}
            >
              <CloudUpload className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
              Live Run &amp; Event Timeline
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
              }`}
            >
              Run tests in real time using high-performance serverless proxies. Watch the progress of each request, get live
              updates, and view the event timeline with detailed logs for better debugging.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: WORKFLOW STEPPER (4 Connected Steps) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-[#022c22]'
            }`}
          >
            From a free account to New test, a polled run, then a report you can download
          </h2>
          <p
            className={`text-xs font-medium ${
              isDark ? 'text-blue-200/70' : 'text-emerald-800/80'
            }`}
          >
            Seamless four-step execution pipeline built for developer productivity
          </p>
        </div>

        {/* 4 Connected Step Cards with connector line */}
        <div className="relative">
          {/* Connector line on desktop */}
          <div
            className={`hidden lg:block absolute top-6 left-12 right-12 h-0.5 z-0 ${
              isDark
                ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600'
                : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400'
            }`}
          ></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="purple-card p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    isDark
                      ? 'border border-blue-400 text-blue-300 bg-[#0c1a3a]'
                      : 'border border-emerald-400 text-emerald-800 bg-emerald-50'
                  }`}
                >
                  01
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDark
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                Sign in — no credit card
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
                }`}
              >
                Register with email or Supabase Auth. We create a personal workspace on the free plan.
                Logged-in users land directly on their active testing suite.
              </p>
            </div>

            {/* Step 2 */}
            <div className="purple-card p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    isDark
                      ? 'border border-blue-400 text-blue-300 bg-[#0c1a3a]'
                      : 'border border-emerald-400 text-emerald-800 bg-emerald-50'
                  }`}
                >
                  02
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDark
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                Start inside the free cap
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
                }`}
              >
                Paste curl, set method, URL, query params, headers, and JSON body. Real requests
                execute with millisecond timings and automatic schema checks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="purple-card p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    isDark
                      ? 'border border-blue-400 text-blue-300 bg-[#0c1a3a]'
                      : 'border border-emerald-400 text-emerald-800 bg-emerald-50'
                  }`}
                >
                  03
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDark
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                Verify a domain to go higher
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
                }`}
              >
                Above 250 RPS or 60 seconds, configure endpoint contracts and latency boundaries.
                Save test suites to collections with custom headers.
              </p>
            </div>

            {/* Step 4 */}
            <div className="purple-card p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    isDark
                      ? 'border border-blue-400 text-blue-300 bg-[#0c1a3a]'
                      : 'border border-emerald-400 text-emerald-800 bg-emerald-50'
                  }`}
                >
                  04
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDark
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                Poll live events, then the report
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-300/80' : 'text-emerald-900/80'
                }`}
              >
                Review execution history, latency benchmarks, pass/fail checklists, and error logs
                in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: PRICING PLANS (4 Tiers with INR) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <p
            className={`font-mono text-xs ${
              isDark ? 'text-blue-300/70' : 'text-emerald-800/80'
            }`}
          >
            Prices shown in INR for India. We detect your market from timezone and locale.
          </p>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-[#022c22]'
            }`}
          >
            Transparent, Predictable API Testing Plans
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Plan 1: Free */}
          <div className="purple-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-emerald-800'
                }`}
              >
                FREE
              </span>
              <div className="space-y-1">
                <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                  ₹0
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>
                  600K requests • 250 RPS
                </div>
              </div>

              <div
                className={`space-y-2.5 pt-4 border-t text-xs ${
                  isDark
                    ? 'border-blue-500/20 text-slate-300'
                    : 'border-emerald-200 text-emerald-900/90'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Requests / month
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    600K
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>Max RPS</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    250
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Max test duration
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    1 min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Test history
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    7 days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Team members
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    1
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs border transition-all duration-200 ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] border-emerald-300'
              }`}
            >
              Get started free
            </button>
          </div>

          {/* Plan 2: Starter */}
          <div className="purple-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-emerald-800'
                }`}
              >
                STARTER
              </span>
              <div className="space-y-1">
                <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                  ₹2,799
                  <span
                    className={`text-xs font-normal ${
                      isDark ? 'text-slate-400' : 'text-emerald-800/70'
                    }`}
                  >
                    /mo
                  </span>
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>
                  12M requests • 7K RPS
                </div>
              </div>

              <div
                className={`space-y-2.5 pt-4 border-t text-xs ${
                  isDark
                    ? 'border-blue-500/20 text-slate-300'
                    : 'border-emerald-200 text-emerald-900/90'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Requests / month
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    12M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>Max RPS</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    7K
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Max test duration
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    5 min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Test history
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    30 days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Team members
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    3
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs border transition-all duration-200 ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] border-emerald-300'
              }`}
            >
              Choose Starter
            </button>
          </div>

          {/* Plan 3: Growth (Most Popular) */}
          <div
            className={`purple-card p-6 rounded-2xl flex flex-col justify-between space-y-6 relative ${
              isDark
                ? 'border-blue-500 shadow-xl shadow-blue-900/30'
                : 'border-emerald-500 shadow-xl shadow-emerald-900/15'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-blue-300' : 'text-emerald-800'
                  }`}
                >
                  GROWTH
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm ${
                    isDark ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}
                >
                  MOST POPULAR
                </span>
              </div>

              <div className="space-y-1">
                <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                  ₹5,599
                  <span
                    className={`text-xs font-normal ${
                      isDark ? 'text-slate-400' : 'text-emerald-800/70'
                    }`}
                  >
                    /mo
                  </span>
                </div>
                <div
                  className={`text-xs ${
                    isDark ? 'text-blue-200/70' : 'text-emerald-800/80 font-medium'
                  }`}
                >
                  30M requests • 15K RPS
                </div>
              </div>

              <div
                className={`space-y-2.5 pt-4 border-t text-xs ${
                  isDark
                    ? 'border-blue-500/20 text-slate-300'
                    : 'border-emerald-200 text-emerald-900/90'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Requests / month
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    30M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>Max RPS</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    15K
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Max test duration
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    10 min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Test history
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    90 days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Team members
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    10
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className={`w-full py-2.5 px-4 rounded-lg text-white font-bold text-xs shadow-md transition-all duration-200 ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              Start Growth →
            </button>
          </div>

          {/* Plan 4: Scale */}
          <div className="purple-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-emerald-800'
                }`}
              >
                SCALE
              </span>
              <div className="space-y-1">
                <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                  ₹11,299
                  <span
                    className={`text-xs font-normal ${
                      isDark ? 'text-slate-400' : 'text-emerald-800/70'
                    }`}
                  >
                    /mo
                  </span>
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-emerald-800/70'}`}>
                  70M requests • 25K RPS
                </div>
              </div>

              <div
                className={`space-y-2.5 pt-4 border-t text-xs ${
                  isDark
                    ? 'border-blue-500/20 text-slate-300'
                    : 'border-emerald-200 text-emerald-900/90'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Requests / month
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    70M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>Max RPS</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    25K
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Max test duration
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    15 min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Test history
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    1 year
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-emerald-800/80'}>
                    Team members
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#064e3b]'}`}>
                    Unlimited
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs border transition-all duration-200 ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] border-emerald-300'
              }`}
            >
              Choose Scale
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
