// MaterialFlow AI — Template-Based Code Generation Engine
// Generates complete, self-contained HTML apps from prompt analysis

const TEMPLATES = {
  gym: {
    title: 'Gym Tracker',
    description: 'A fitness tracking app with workout logging, progress stats, and dark mode UI.',
    keywords: ['gym', 'fitness', 'workout', 'exercise', 'tracker', 'health'],
    generate: (prompt) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gym Tracker</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0f172a;--card:#1e293b;--border:#334155;--primary:#6366f1;--primary-glow:#818cf8;--text:#f1f5f9;--text2:#94a3b8;--green:#22c55e;--orange:#f59e0b;--red:#ef4444}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.app{max-width:480px;margin:0 auto;padding:16px}
header{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--border);margin-bottom:24px}
header h1{font-size:22px;font-weight:800;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;transition:transform .2s}
.stat-card:hover{transform:translateY(-2px)}
.stat-label{font-size:12px;color:var(--text2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.stat-value{font-size:28px;font-weight:800}
.stat-change{font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;display:inline-block;margin-top:6px}
.stat-change.up{background:rgba(34,197,94,.15);color:var(--green)}
.stat-change.down{background:rgba(239,68,68,.15);color:var(--red)}
.section-title{font-size:14px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:1.5px;margin:24px 0 12px}
.workout-list{display:flex;flex-direction:column;gap:8px}
.workout-item{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .2s}
.workout-item:hover{border-color:var(--primary);background:#1e293bdd}
.workout-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0}
.workout-icon.chest{background:rgba(99,102,241,.15);color:var(--primary-glow)}
.workout-icon.legs{background:rgba(34,197,94,.15);color:var(--green)}
.workout-icon.back{background:rgba(245,158,11,.15);color:var(--orange)}
.workout-info{flex:1}
.workout-name{font-size:14px;font-weight:600;margin-bottom:2px}
.workout-meta{font-size:12px;color:var(--text2)}
.workout-dur{font-size:12px;color:var(--text2);font-weight:600}
.bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:var(--card);border-top:1px solid var(--border);display:flex;justify-content:space-around;padding:10px 0 20px}
.nav-item{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;color:var(--text2);cursor:pointer;transition:color .2s;background:none;border:none}
.nav-item.active{color:var(--primary-glow)}
.nav-item svg{width:22px;height:22px}
.fab{position:fixed;bottom:80px;right:calc(50% - 210px);width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#8b5cf6);border:none;color:white;font-size:28px;cursor:pointer;box-shadow:0 4px 20px rgba(99,102,241,.4);display:flex;align-items:center;justify-content:center;transition:transform .2s}
.fab:hover{transform:scale(1.08)}
.streak-bar{background:linear-gradient(90deg,var(--primary),#8b5cf6);border-radius:12px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.streak-text{font-size:14px;font-weight:600}
.streak-count{font-size:24px;font-weight:800;display:flex;align-items:center;gap:6px}
</style>
</head>
<body>
<div class="app">
  <header>
    <h1>Gym Tracker</h1>
    <div style="display:flex;gap:8px">
      <button style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:8px 10px;color:var(--text2);cursor:pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </button>
      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">A</div>
    </div>
  </header>

  <div class="streak-bar">
    <div><div class="streak-text">Current Streak</div><div style="font-size:12px;color:rgba(255,255,255,.7);margin-top:2px">Keep it going!</div></div>
    <div class="streak-count"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c.5 5.5-2.5 8.5-2.5 12a5 5 0 0 0 10 0c0-6-4-8-4-8 0 3-1.5 5-3 6.5C11 11 12 7 12 2z"/></svg> 12 days</div>
  </div>

  <div class="stats">
    <div class="stat-card"><div class="stat-label">Workouts</div><div class="stat-value">42</div><span class="stat-change up">+8%</span></div>
    <div class="stat-card"><div class="stat-label">This Week</div><div class="stat-value">5</div><span class="stat-change up">+2</span></div>
    <div class="stat-card"><div class="stat-label">Calories</div><div class="stat-value">3.2k</div><span class="stat-change down">-5%</span></div>
    <div class="stat-card"><div class="stat-label">Hours</div><div class="stat-value">26</div><span class="stat-change up">+12%</span></div>
  </div>

  <div class="section-title">Today's Workout</div>
  <div class="workout-list">
    <div class="workout-item"><div class="workout-icon chest">C</div><div class="workout-info"><div class="workout-name">Chest & Triceps</div><div class="workout-meta">5 exercises · 18 sets</div></div><div class="workout-dur">45 min</div></div>
    <div class="workout-item"><div class="workout-icon legs">L</div><div class="workout-info"><div class="workout-name">Leg Day</div><div class="workout-meta">6 exercises · 20 sets</div></div><div class="workout-dur">55 min</div></div>
    <div class="workout-item"><div class="workout-icon back">B</div><div class="workout-info"><div class="workout-name">Back & Biceps</div><div class="workout-meta">5 exercises · 16 sets</div></div><div class="workout-dur">40 min</div></div>
  </div>
  <div style="height:100px"></div>

  <button class="fab">+</button>

  <div class="bottom-nav">
    <button class="nav-item active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>Home</button>
    <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6.5 6.5 11 11"/><path d="m21 21-4.3-4.3"/><path d="M9.8 4.6A2 2 0 0 1 11 3h2a2 2 0 0 1 2 2v1.2"/><path d="M3 12v4a2 2 0 0 0 2 2h1.3"/><path d="m6.5 6.5-3 3"/><path d="M21 3v4a2 2 0 0 1-2 2h-4"/></svg>Workouts</button>
    <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>Progress</button>
    <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>Profile</button>
  </div>
</div>
</body></html>`,
  },

  dashboard: {
    title: 'Analytics Dashboard',
    description: 'Data analytics dashboard with KPI cards, charts, and metrics tables.',
    keywords: ['dashboard', 'analytics', 'chart', 'data', 'metrics', 'kpi', 'report'],
    generate: (prompt) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Analytics Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;background:#0B1120;color:#E2E8F0;display:flex;min-height:100vh}
.sidebar{width:240px;background:#111827;border-right:1px solid #1F2937;padding:20px 12px;display:flex;flex-direction:column}
.logo{font-size:18px;font-weight:800;padding:0 12px 24px;background:linear-gradient(135deg,#3B82F6,#8B5CF6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;font-size:13px;font-weight:500;color:#9CA3AF;cursor:pointer;transition:all .15s;border:none;background:none;width:100%;text-align:left}
.nav-item:hover{background:#1F2937;color:#E5E7EB}
.nav-item.active{background:rgba(59,130,246,.12);color:#60A5FA}
.nav-item svg{width:18px;height:18px;flex-shrink:0}
.main{flex:1;overflow-y:auto;padding:24px 28px}
.page-title{font-size:22px;font-weight:700;margin-bottom:4px}
.page-sub{font-size:13px;color:#6B7280;margin-bottom:24px}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
.kpi{background:#111827;border:1px solid #1F2937;border-radius:14px;padding:20px}
.kpi-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:#6B7280;margin-bottom:10px}
.kpi-val{font-size:30px;font-weight:800;margin-bottom:6px}
.kpi-change{font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px}
.kpi-change.up{background:rgba(34,197,94,.12);color:#4ADE80}
.kpi-change.down{background:rgba(239,68,68,.12);color:#F87171}
.chart-card{background:#111827;border:1px solid #1F2937;border-radius:14px;padding:20px;margin-bottom:20px}
.chart-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.chart-title{font-size:14px;font-weight:600}
.chart-area{height:200px;position:relative;display:flex;align-items:flex-end;gap:8px;padding-top:20px}
.bar{flex:1;border-radius:6px 6px 0 0;transition:height .5s cubic-bezier(.34,1.56,.64,1);cursor:pointer;position:relative;min-height:8px}
.bar:hover{opacity:.85}
.bar-label{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:10px;color:#6B7280}
.table-card{background:#111827;border:1px solid #1F2937;border-radius:14px;overflow:hidden}
.table-header{padding:16px 20px;border-bottom:1px solid #1F2937;font-size:14px;font-weight:600}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:10px 20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6B7280;border-bottom:1px solid #1F2937}
td{padding:12px 20px;font-size:13px;border-bottom:1px solid #1F2937}
tr:last-child td{border:none}
tr:hover{background:rgba(255,255,255,.02)}
.badge{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700}
.badge-green{background:rgba(34,197,94,.12);color:#4ADE80}
.badge-blue{background:rgba(59,130,246,.12);color:#60A5FA}
.badge-yellow{background:rgba(245,158,11,.12);color:#FBBF24}
</style>
</head>
<body>
<div class="sidebar">
  <div class="logo">DataForge</div>
  <button class="nav-item active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</button>
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>Analytics</button>
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Users</button>
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m8.66-11-5.2 3m-6.92 4-5.2 3M20.66 17l-5.2-3M9.34 10l-5.2-3"/></svg>Settings</button>
</div>
<div class="main">
  <div class="page-title">Dashboard</div>
  <div class="page-sub">Welcome back. Here's your overview for today.</div>
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">Revenue</div><div class="kpi-val">$42.8k</div><span class="kpi-change up">+12.5%</span></div>
    <div class="kpi"><div class="kpi-label">Users</div><div class="kpi-val">8,249</div><span class="kpi-change up">+4.2%</span></div>
    <div class="kpi"><div class="kpi-label">Conversion</div><div class="kpi-val">3.6%</div><span class="kpi-change down">-0.8%</span></div>
    <div class="kpi"><div class="kpi-label">Sessions</div><div class="kpi-val">24.1k</div><span class="kpi-change up">+18%</span></div>
  </div>
  <div class="chart-card">
    <div class="chart-header"><span class="chart-title">Revenue Overview</span><span style="font-size:12px;color:#6B7280">Last 12 months</span></div>
    <div class="chart-area">
      <div class="bar" style="height:45%;background:linear-gradient(180deg,#3B82F6,#1D4ED8)"><span class="bar-label">Jan</span></div>
      <div class="bar" style="height:62%;background:linear-gradient(180deg,#3B82F6,#1D4ED8)"><span class="bar-label">Feb</span></div>
      <div class="bar" style="height:55%;background:linear-gradient(180deg,#3B82F6,#1D4ED8)"><span class="bar-label">Mar</span></div>
      <div class="bar" style="height:78%;background:linear-gradient(180deg,#3B82F6,#1D4ED8)"><span class="bar-label">Apr</span></div>
      <div class="bar" style="height:68%;background:linear-gradient(180deg,#3B82F6,#1D4ED8)"><span class="bar-label">May</span></div>
      <div class="bar" style="height:85%;background:linear-gradient(180deg,#8B5CF6,#6D28D9)"><span class="bar-label">Jun</span></div>
      <div class="bar" style="height:72%;background:linear-gradient(180deg,#3B82F6,#1D4ED8)"><span class="bar-label">Jul</span></div>
      <div class="bar" style="height:90%;background:linear-gradient(180deg,#8B5CF6,#6D28D9)"><span class="bar-label">Aug</span></div>
      <div class="bar" style="height:82%;background:linear-gradient(180deg,#3B82F6,#1D4ED8)"><span class="bar-label">Sep</span></div>
      <div class="bar" style="height:95%;background:linear-gradient(180deg,#8B5CF6,#6D28D9)"><span class="bar-label">Oct</span></div>
      <div class="bar" style="height:88%;background:linear-gradient(180deg,#3B82F6,#1D4ED8)"><span class="bar-label">Nov</span></div>
      <div class="bar" style="height:100%;background:linear-gradient(180deg,#8B5CF6,#6D28D9)"><span class="bar-label">Dec</span></div>
    </div>
  </div>
  <div class="table-card">
    <div class="table-header">Recent Transactions</div>
    <table>
      <tr><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
      <tr><td>Sarah Chen</td><td>$1,240</td><td><span class="badge badge-green">Completed</span></td><td>Dec 18</td></tr>
      <tr><td>Alex Johnson</td><td>$890</td><td><span class="badge badge-blue">Processing</span></td><td>Dec 17</td></tr>
      <tr><td>Mike Rivera</td><td>$2,100</td><td><span class="badge badge-green">Completed</span></td><td>Dec 16</td></tr>
      <tr><td>Emily Park</td><td>$450</td><td><span class="badge badge-yellow">Pending</span></td><td>Dec 15</td></tr>
    </table>
  </div>
</div>
</body></html>`,
  },

  todo: {
    title: 'Task Manager',
    description: 'A sleek task management app with categories, due dates, and progress tracking.',
    keywords: ['todo', 'task', 'kanban', 'project', 'planner', 'productivity', 'board'],
    generate: (prompt) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TaskFlow</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif;background:#0F172A;color:#E2E8F0;min-height:100vh;padding:24px}
.container{max-width:900px;margin:0 auto}
header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px}
h1{font-size:24px;font-weight:800;background:linear-gradient(135deg,#3B82F6,#8B5CF6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.add-btn{background:linear-gradient(135deg,#3B82F6,#6366F1);border:none;color:white;padding:10px 20px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px}
.columns{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
.column{background:#1E293B;border:1px solid #334155;border-radius:16px;padding:16px}
.col-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #334155}
.col-title{font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px}
.col-count{background:#334155;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
.task{background:#0F172A;border:1px solid #334155;border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;transition:all .15s}
.task:hover{border-color:#4B5563;transform:translateY(-1px)}
.task-title{font-size:13px;font-weight:600;margin-bottom:8px}
.task-desc{font-size:11px;color:#94A3B8;line-height:1.5;margin-bottom:10px}
.task-footer{display:flex;align-items:center;justify-content:space-between}
.task-tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:8px}
.tag-design{background:rgba(139,92,246,.15);color:#A78BFA}
.tag-dev{background:rgba(59,130,246,.15);color:#60A5FA}
.tag-bug{background:rgba(239,68,68,.15);color:#F87171}
.tag-feature{background:rgba(34,197,94,.15);color:#4ADE80}
.task-date{font-size:10px;color:#6B7280}
.task-avatar{width:22px;height:22px;border-radius:50%;border:2px solid #1E293B}
.dot{width:8px;height:8px;border-radius:50%}
.dot-blue{background:#3B82F6}.dot-yellow{background:#F59E0B}.dot-green{background:#22C55E}
</style>
</head>
<body>
<div class="container">
<header><h1>TaskFlow</h1><button class="add-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>New Task</button></header>
<div class="columns">
  <div class="column">
    <div class="col-header"><span class="col-title"><span class="dot dot-blue"></span>To Do</span><span class="col-count">4</span></div>
    <div class="task"><div class="task-title">Design new landing page</div><div class="task-desc">Create wireframes and high-fidelity mockups for the marketing site redesign</div><div class="task-footer"><span class="task-tag tag-design">Design</span><span class="task-date">Dec 20</span></div></div>
    <div class="task"><div class="task-title">API rate limiting</div><div class="task-desc">Implement request throttling for public API endpoints</div><div class="task-footer"><span class="task-tag tag-dev">Backend</span><span class="task-date">Dec 22</span></div></div>
    <div class="task"><div class="task-title">Fix auth redirect loop</div><div class="task-desc">Users stuck in redirect after OAuth callback on mobile</div><div class="task-footer"><span class="task-tag tag-bug">Bug</span><span class="task-date">Dec 18</span></div></div>
  </div>
  <div class="column">
    <div class="col-header"><span class="col-title"><span class="dot dot-yellow"></span>In Progress</span><span class="col-count">3</span></div>
    <div class="task"><div class="task-title">Dark mode toggle</div><div class="task-desc">Add system preference detection and manual override switch</div><div class="task-footer"><span class="task-tag tag-feature">Feature</span><span class="task-date">Dec 19</span></div></div>
    <div class="task"><div class="task-title">Search component</div><div class="task-desc">Build fuzzy search with keyboard navigation and recent history</div><div class="task-footer"><span class="task-tag tag-dev">Frontend</span><span class="task-date">Dec 21</span></div></div>
  </div>
  <div class="column">
    <div class="col-header"><span class="col-title"><span class="dot dot-green"></span>Done</span><span class="col-count">5</span></div>
    <div class="task"><div class="task-title">User onboarding flow</div><div class="task-desc">Multi-step wizard with progress indicators and skip options</div><div class="task-footer"><span class="task-tag tag-feature">Feature</span><span class="task-date">Dec 15</span></div></div>
    <div class="task"><div class="task-title">Database migration</div><div class="task-desc">Migrate from MongoDB to PostgreSQL with zero downtime</div><div class="task-footer"><span class="task-tag tag-dev">Backend</span><span class="task-date">Dec 14</span></div></div>
  </div>
</div>
</div>
</body></html>`,
  },

  ecommerce: {
    title: 'E-commerce Store',
    description: 'Modern online store with product grid, cart, and checkout flow.',
    keywords: ['ecommerce', 'store', 'shop', 'product', 'cart', 'checkout', 'buy', 'sell'],
    generate: (prompt) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Store</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif;background:#0A0A0F;color:#E5E7EB;min-height:100vh}
nav{background:#111118;border-bottom:1px solid #1F1F2E;padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{font-size:20px;font-weight:800;background:linear-gradient(135deg,#818CF8,#C084FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links{display:flex;gap:28px;font-size:13px;color:#9CA3AF}
.nav-links a{color:inherit;text-decoration:none;transition:color .15s}.nav-links a:hover{color:#E5E7EB}
.nav-actions{display:flex;align-items:center;gap:16px}
.cart-btn{position:relative;background:none;border:1px solid #2D2D3F;border-radius:10px;padding:8px 10px;color:#9CA3AF;cursor:pointer}
.cart-badge{position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:#6366F1;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
.container{max-width:1200px;margin:0 auto;padding:32px}
.hero{text-align:center;padding:48px 0 40px}
.hero h1{font-size:36px;font-weight:800;margin-bottom:12px;background:linear-gradient(135deg,#E5E7EB,#818CF8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{color:#6B7280;font-size:15px;max-width:500px;margin:0 auto 24px}
.filters{display:flex;gap:8px;justify-content:center;margin-bottom:32px}
.filter-btn{padding:8px 18px;border-radius:20px;border:1px solid #2D2D3F;background:transparent;color:#9CA3AF;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.filter-btn.active{background:#6366F1;border-color:#6366F1;color:white}
.filter-btn:hover{border-color:#4B5563}
.products{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.product{background:#111118;border:1px solid #1F1F2E;border-radius:16px;overflow:hidden;transition:all .2s;cursor:pointer}
.product:hover{border-color:#2D2D3F;transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.3)}
.product-img{height:200px;display:flex;align-items:center;justify-content:center;font-size:48px;position:relative}
.product-img-1{background:linear-gradient(135deg,#1E1B4B,#312E81)}.product-img-2{background:linear-gradient(135deg,#1C1917,#292524)}.product-img-3{background:linear-gradient(135deg,#0C1B2A,#1E3A5F)}
.product-img-4{background:linear-gradient(135deg,#1A1A2E,#16213E)}.product-img-5{background:linear-gradient(135deg,#1B2A1B,#2D4A2D)}.product-img-6{background:linear-gradient(135deg,#2A1B1B,#4A2D2D)}
.product-badge{position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:8px;font-size:10px;font-weight:700;background:rgba(99,102,241,.9);color:white}
.product-info{padding:16px}
.product-name{font-size:14px;font-weight:600;margin-bottom:4px}
.product-cat{font-size:11px;color:#6B7280;margin-bottom:10px}
.product-footer{display:flex;align-items:center;justify-content:space-between}
.product-price{font-size:18px;font-weight:800;color:#818CF8}
.add-cart{background:#6366F1;border:none;color:white;padding:8px 14px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s}
.add-cart:hover{background:#4F46E5}
</style>
</head>
<body>
<nav><span class="nav-logo">TechStore</span><div class="nav-links"><a href="#">Home</a><a href="#">Products</a><a href="#">Deals</a><a href="#">About</a></div><div class="nav-actions"><button class="cart-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg><span class="cart-badge">3</span></button></div></nav>
<div class="container">
  <div class="hero"><h1>Premium Tech Collection</h1><p>Curated selection of the finest technology products, designed for those who demand excellence.</p></div>
  <div class="filters"><button class="filter-btn active">All</button><button class="filter-btn">Audio</button><button class="filter-btn">Wearables</button><button class="filter-btn">Accessories</button><button class="filter-btn">New</button></div>
  <div class="products">
    <div class="product"><div class="product-img product-img-1"><span style="font-size:56px">🎧</span><span class="product-badge">New</span></div><div class="product-info"><div class="product-name">AirPods Max Pro</div><div class="product-cat">Wireless Headphones</div><div class="product-footer"><span class="product-price">$549</span><button class="add-cart">Add to Cart</button></div></div></div>
    <div class="product"><div class="product-img product-img-2"><span style="font-size:56px">⌚</span></div><div class="product-info"><div class="product-name">Smart Watch Ultra</div><div class="product-cat">Wearable Tech</div><div class="product-footer"><span class="product-price">$399</span><button class="add-cart">Add to Cart</button></div></div></div>
    <div class="product"><div class="product-img product-img-3"><span style="font-size:56px">📱</span><span class="product-badge">-20%</span></div><div class="product-info"><div class="product-name">Leather Folio Case</div><div class="product-cat">Phone Accessories</div><div class="product-footer"><span class="product-price">$79</span><button class="add-cart">Add to Cart</button></div></div></div>
    <div class="product"><div class="product-img product-img-4"><span style="font-size:56px">🖥</span></div><div class="product-info"><div class="product-name">4K Monitor Pro</div><div class="product-cat">Displays</div><div class="product-footer"><span class="product-price">$899</span><button class="add-cart">Add to Cart</button></div></div></div>
    <div class="product"><div class="product-img product-img-5"><span style="font-size:56px">🔌</span></div><div class="product-info"><div class="product-name">USB-C Hub Max</div><div class="product-cat">Accessories</div><div class="product-footer"><span class="product-price">$129</span><button class="add-cart">Add to Cart</button></div></div></div>
    <div class="product"><div class="product-img product-img-6"><span style="font-size:56px">🎙</span></div><div class="product-info"><div class="product-name">Studio Mic Pro</div><div class="product-cat">Audio Equipment</div><div class="product-footer"><span class="product-price">$249</span><button class="add-cart">Add to Cart</button></div></div></div>
  </div>
</div>
</body></html>`,
  },

  landing: {
    title: 'Landing Page',
    description: 'A modern SaaS landing page with hero, features, and CTA sections.',
    keywords: ['landing', 'page', 'website', 'hero', 'saas', 'marketing', 'portfolio', 'personal'],
    generate: (prompt) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LaunchPad</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif;background:#09090B;color:#FAFAFA;min-height:100vh}
nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid #1A1A1E}
.logo{font-size:20px;font-weight:800;display:flex;align-items:center;gap:8px}
.logo-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center}
.nav-center{display:flex;gap:32px;font-size:14px;color:#A1A1AA}
.nav-center a{color:inherit;text-decoration:none;transition:color .15s}.nav-center a:hover{color:#FAFAFA}
.cta{background:#6366F1;color:white;border:none;padding:10px 22px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer}
.hero{text-align:center;padding:100px 48px 80px;max-width:800px;margin:0 auto}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:#1A1A2E;border:1px solid #2D2D3F;padding:6px 14px;border-radius:20px;font-size:12px;color:#A78BFA;margin-bottom:24px;font-weight:500}
.hero h1{font-size:56px;font-weight:800;line-height:1.1;letter-spacing:-1.5px;margin-bottom:20px;background:linear-gradient(180deg,#FAFAFA 0%,#71717A 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:18px;color:#71717A;line-height:1.7;max-width:560px;margin:0 auto 36px}
.hero-btns{display:flex;gap:12px;justify-content:center}
.btn-primary{background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white;border:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;cursor:pointer;transition:all .2s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,.3)}
.btn-secondary{background:transparent;color:#FAFAFA;border:1px solid #27272A;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;cursor:pointer;transition:all .2s}
.btn-secondary:hover{border-color:#3F3F46;background:#18181B}
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1000px;margin:0 auto;padding:0 48px 80px}
.feature{background:#111113;border:1px solid #1A1A1E;border-radius:16px;padding:28px;transition:all .2s}
.feature:hover{border-color:#27272A;transform:translateY(-2px)}
.feature-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.fi-1{background:rgba(99,102,241,.12);color:#818CF8}
.fi-2{background:rgba(34,197,94,.12);color:#4ADE80}
.fi-3{background:rgba(245,158,11,.12);color:#FBBF24}
.feature h3{font-size:16px;font-weight:700;margin-bottom:8px}
.feature p{font-size:13px;color:#71717A;line-height:1.7}
.social-proof{text-align:center;padding:40px 48px 80px}
.social-proof p{font-size:14px;color:#52525B;margin-bottom:20px}
.avatars{display:flex;justify-content:center}
.avatars span{width:36px;height:36px;border-radius:50%;border:3px solid #09090B;margin-left:-8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px}
.av-1{background:#6366F1;color:white}.av-2{background:#8B5CF6;color:white}.av-3{background:#3B82F6;color:white}.av-4{background:#EC4899;color:white}.av-5{background:#F59E0B;color:white}
</style>
</head>
<body>
<nav><div class="logo"><div class="logo-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg></div>LaunchPad</div><div class="nav-center"><a href="#">Features</a><a href="#">Pricing</a><a href="#">Docs</a><a href="#">Blog</a></div><button class="cta">Get Started</button></nav>
<div class="hero">
  <div class="hero-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg> Now with AI-powered features</div>
  <h1>Build faster.<br>Ship smarter.</h1>
  <p>The modern development platform that accelerates your workflow with AI-powered code generation, real-time collaboration, and instant deployment.</p>
  <div class="hero-btns"><button class="btn-primary">Start Building Free</button><button class="btn-secondary">View Demo</button></div>
</div>
<div class="features">
  <div class="feature"><div class="feature-icon fi-1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg></div><h3>Lightning Fast</h3><p>Deploy in seconds with our edge network. Zero config, zero downtime, global CDN out of the box.</p></div>
  <div class="feature"><div class="feature-icon fi-2"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg></div><h3>Enterprise Security</h3><p>SOC 2 compliant with end-to-end encryption, SSO support, and advanced access controls.</p></div>
  <div class="feature"><div class="feature-icon fi-3"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><h3>Team Collaboration</h3><p>Real-time editing, code reviews, and shared workspaces for teams of any size.</p></div>
</div>
<div class="social-proof"><p>Trusted by 10,000+ developers worldwide</p><div class="avatars"><span class="av-1">S</span><span class="av-2">A</span><span class="av-3">M</span><span class="av-4">E</span><span class="av-5">J</span></div></div>
</body></html>`,
  },

  weather: {
    title: 'Weather App',
    description: 'Live weather dashboard with real API data, geolocation, city search, and forecasts.',
    keywords: ['weather', 'forecast', 'temperature', 'climate', 'rain', 'sun'],
    generate: (prompt) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Weather</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif;background:linear-gradient(180deg,#0C1445 0%,#1A237E 50%,#283593 100%);color:white;min-height:100vh;display:flex;align-items:center;justify-content:center}
.app{width:420px;padding:32px;position:relative}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}
.location{font-size:18px;font-weight:600;display:flex;align-items:center;gap:6px}
.date{font-size:12px;color:rgba(255,255,255,.6)}
.search-box{position:relative;margin-bottom:20px}
.search-input{width:100%;padding:10px 14px 10px 36px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:12px;color:white;font-size:13px;outline:none;font-family:inherit;backdrop-filter:blur(10px)}
.search-input::placeholder{color:rgba(255,255,255,.4)}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.4)}
.search-results{position:absolute;top:100%;left:0;right:0;background:rgba(15,20,69,.95);border:1px solid rgba(255,255,255,.15);border-radius:12px;margin-top:4px;overflow:hidden;z-index:10;backdrop-filter:blur(20px)}
.search-result{padding:10px 14px;cursor:pointer;font-size:13px;display:flex;justify-content:space-between;transition:background .15s}
.search-result:hover{background:rgba(255,255,255,.08)}
.search-result span{color:rgba(255,255,255,.5);font-size:11px}
.current{text-align:center;margin-bottom:40px}
.temp{font-size:96px;font-weight:200;line-height:1;margin-bottom:8px}
.condition{font-size:16px;color:rgba(255,255,255,.7);margin-bottom:4px}
.feels{font-size:13px;color:rgba(255,255,255,.4)}
.details{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:32px}
.detail{background:rgba(255,255,255,.08);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:16px;text-align:center}
.detail-label{font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.detail-val{font-size:18px;font-weight:700}
.detail-unit{font-size:11px;color:rgba(255,255,255,.4)}
.forecast-title{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.4);margin-bottom:14px}
.hourly{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:24px;scrollbar-width:none}
.hourly::-webkit-scrollbar{display:none}
.hour{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px 14px;text-align:center;min-width:68px;flex-shrink:0}
.hour.now{background:rgba(99,102,241,.3);border-color:rgba(99,102,241,.5)}
.hour-time{font-size:10px;color:rgba(255,255,255,.5);margin-bottom:8px}
.hour-icon{font-size:20px;margin-bottom:6px}
.hour-temp{font-size:14px;font-weight:700}
.daily{display:flex;flex-direction:column;gap:6px}
.day{display:flex;align-items:center;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,.04)}
.day-name{width:60px;font-size:13px;font-weight:500}
.day-icon{flex:1;font-size:18px;text-align:center}
.day-range{font-size:13px;font-weight:500;text-align:right}
.day-range span{color:rgba(255,255,255,.4)}
.sunrise-bar{display:flex;justify-content:space-between;margin-top:20px;padding:12px 16px;background:rgba(255,255,255,.04);border-radius:12px;font-size:12px;color:rgba(255,255,255,.5)}
.sunrise-bar strong{color:white;font-weight:600}
.loading{text-align:center;padding:60px 0;color:rgba(255,255,255,.5);font-size:14px}
.spinner{width:32px;height:32px;border:3px solid rgba(255,255,255,.1);border-top-color:rgba(99,102,241,.7);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.unit-toggle{display:flex;gap:4px;background:rgba(255,255,255,.08);border-radius:8px;padding:2px}
.unit-btn{background:none;border:none;color:rgba(255,255,255,.5);padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer}
.unit-btn.active{background:rgba(99,102,241,.4);color:white}
</style>
</head>
<body>
<div class="app" id="app">
  <div class="loading" id="loading"><div class="spinner"></div>Detecting location...</div>
</div>
<script>
const WMO={0:{l:"Clear sky",i:"☀️"},1:{l:"Mainly clear",i:"🌤️"},2:{l:"Partly cloudy",i:"⛅"},3:{l:"Overcast",i:"☁️"},45:{l:"Fog",i:"🌫️"},48:{l:"Icy fog",i:"🌫️"},51:{l:"Light drizzle",i:"🌦️"},53:{l:"Drizzle",i:"🌦️"},55:{l:"Heavy drizzle",i:"🌧️"},61:{l:"Slight rain",i:"🌧️"},63:{l:"Rain",i:"🌧️"},65:{l:"Heavy rain",i:"🌧️"},71:{l:"Slight snow",i:"❄️"},73:{l:"Snow",i:"❄️"},75:{l:"Heavy snow",i:"❄️"},80:{l:"Rain showers",i:"🌦️"},85:{l:"Snow showers",i:"🌨️"},95:{l:"Thunderstorm",i:"⛈️"},99:{l:"Hail storm",i:"⛈️"}};
const uvLabel=uv=>uv<=2?"low":uv<=5?"moderate":uv<=7?"high":uv<=10?"very high":"extreme";
let unit="celsius";
let currentLat,currentLon,currentCity;

async function init(){
  try{
    const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:10000}));
    currentLat=pos.coords.latitude;currentLon=pos.coords.longitude;
    const geo=await fetch(\`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=\${currentLat}&longitude=\${currentLon}&localityLanguage=en\`).then(r=>r.json());
    currentCity=geo.city||geo.locality||geo.principalSubdivision||"Your Location";
    await fetchWeather();
  }catch(e){currentLat=28.6139;currentLon=77.209;currentCity="New Delhi";await fetchWeather();}
}

async function fetchWeather(){
  const CACHE_KEY=\`weather_\${currentLat.toFixed(2)}_\${currentLon.toFixed(2)}_\${unit}\`;
  const cached=sessionStorage.getItem(CACHE_KEY);
  if(cached){const{data,ts}=JSON.parse(cached);if(Date.now()-ts<600000){render(data);return;}}

  const params=new URLSearchParams({latitude:currentLat,longitude:currentLon,timezone:"auto",
    temperature_unit:unit,wind_speed_unit:"kmh",
    current:["temperature_2m","apparent_temperature","relative_humidity_2m","wind_speed_10m","weather_code","uv_index","is_day"].join(","),
    hourly:["temperature_2m","weather_code","precipitation_probability"].join(","),
    daily:["weather_code","temperature_2m_max","temperature_2m_min","sunrise","sunset","uv_index_max"].join(","),
    forecast_days:"7"});
  const data=await fetch(\`https://api.open-meteo.com/v1/forecast?\${params}\`).then(r=>r.json());
  sessionStorage.setItem(CACHE_KEY,JSON.stringify({data,ts:Date.now()}));
  render(data);
}

function render(d){
  const c=d.current;const w=WMO[c.weather_code]||{l:"Unknown",i:"🌡️"};
  const now=new Date();const dayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const hi=d.hourly.time.findIndex(t=>new Date(t)>=now);
  const hours=d.hourly.time.slice(hi,hi+12).map((t,i)=>{
    const h=new Date(t).getHours();const tl=h===0?"12AM":h===12?"12PM":h<12?h+"AM":(h-12)+"PM";
    return{time:i===0?"Now":tl,temp:Math.round(d.hourly.temperature_2m[hi+i]),icon:(WMO[d.hourly.weather_code[hi+i]]||{i:"🌡️"}).i};
  });
  const days=d.daily.time.map((t,i)=>({
    name:i===0?"Today":dayNames[new Date(t).getDay()],
    icon:(WMO[d.daily.weather_code[i]]||{i:"🌡️"}).i,
    max:Math.round(d.daily.temperature_2m_max[i]),
    min:Math.round(d.daily.temperature_2m_min[i])
  }));
  const sr=d.daily.sunrise?new Date(d.daily.sunrise[0]).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"";
  const ss=d.daily.sunset?new Date(d.daily.sunset[0]).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"";
  const deg=unit==="celsius"?"°C":"°F";

  document.getElementById("app").innerHTML=\`
  <div class="header"><div><div class="location"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>\${currentCity}</div><div class="date">\${now.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}</div></div>
  <div class="unit-toggle"><button class="unit-btn \${unit==="celsius"?"active":""}" onclick="setUnit('celsius')">°C</button><button class="unit-btn \${unit==="fahrenheit"?"active":""}" onclick="setUnit('fahrenheit')">°F</button></div></div>
  <div class="search-box"><svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="search-input" placeholder="Search city..." oninput="searchCity(this.value)" id="searchInput"><div class="search-results" id="searchResults" style="display:none"></div></div>
  <div class="current"><div class="temp">\${Math.round(c.temperature_2m)}°</div><div class="condition">\${w.i} \${w.l}</div><div class="feels">Feels like \${Math.round(c.apparent_temperature)}\${deg}</div></div>
  <div class="details"><div class="detail"><div class="detail-label">Humidity</div><div class="detail-val">\${c.relative_humidity_2m}<span class="detail-unit">%</span></div></div><div class="detail"><div class="detail-label">Wind</div><div class="detail-val">\${Math.round(c.wind_speed_10m)}<span class="detail-unit">km/h</span></div></div><div class="detail"><div class="detail-label">UV Index</div><div class="detail-val">\${Math.round(c.uv_index)}<span class="detail-unit"> \${uvLabel(c.uv_index)}</span></div></div></div>
  <div class="forecast-title">Hourly Forecast</div>
  <div class="hourly">\${hours.map((h,i)=>\`<div class="hour \${i===0?"now":""}"><div class="hour-time">\${h.time}</div><div class="hour-icon">\${h.icon}</div><div class="hour-temp">\${h.temp}°</div></div>\`).join("")}</div>
  <div class="forecast-title">7-Day Forecast</div>
  <div class="daily">\${days.map(dy=>\`<div class="day"><span class="day-name">\${dy.name}</span><span class="day-icon">\${dy.icon}</span><span class="day-range">\${dy.max}° <span>/ \${dy.min}°</span></span></div>\`).join("")}</div>
  \${sr?\`<div class="sunrise-bar"><span>☀️ Sunrise <strong>\${sr}</strong></span><span>🌙 Sunset <strong>\${ss}</strong></span></div>\`:""}
  \`;
}

let searchTimeout;
async function searchCity(q){
  clearTimeout(searchTimeout);
  const el=document.getElementById("searchResults");
  if(!q||q.length<2){el.style.display="none";return;}
  searchTimeout=setTimeout(async()=>{
    const r=await fetch(\`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(q)}&count=5\`).then(r=>r.json());
    if(!r.results||!r.results.length){el.style.display="none";return;}
    el.style.display="block";
    el.innerHTML=r.results.map(c=>\`<div class="search-result" onclick="selectCity(\${c.latitude},\${c.longitude},'\${(c.name||"").replace(/'/g,"\\\\'")}')"><span>\${c.name}, \${c.admin1||""}</span><span>\${c.country||""}</span></div>\`).join("");
  },300);
}

function selectCity(lat,lon,name){
  currentLat=lat;currentLon=lon;currentCity=name;
  document.getElementById("searchResults").style.display="none";
  document.getElementById("searchInput").value="";
  document.getElementById("app").innerHTML='<div class="loading"><div class="spinner"></div>Loading...</div>';
  fetchWeather();
}

function setUnit(u){unit=u;fetchWeather();}
init();
</script>
</body></html>`,
  },

  chat: {
    title: 'Chat Application',
    description: 'Real-time messaging app with conversations, message bubbles, and online status.',
    keywords: ['chat', 'message', 'messaging', 'social', 'communication', 'inbox'],
    generate: (prompt) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Messages</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif;background:#0F0F15;color:#E5E7EB;display:flex;height:100vh}
.sidebar{width:320px;background:#111118;border-right:1px solid #1F1F2E;display:flex;flex-direction:column}
.sidebar-header{padding:20px;border-bottom:1px solid #1F1F2E;display:flex;align-items:center;justify-content:space-between}
.sidebar-title{font-size:18px;font-weight:700}
.search{margin:12px 16px;background:#1A1A24;border:1px solid #2D2D3F;border-radius:10px;padding:9px 14px;color:#E5E7EB;font-size:13px;outline:none;width:calc(100% - 32px);font-family:inherit}
.search::placeholder{color:#4B5563}
.conv-list{flex:1;overflow-y:auto}
.conv{display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;transition:background .15s;border-left:3px solid transparent}
.conv:hover{background:#1A1A24}
.conv.active{background:rgba(99,102,241,.08);border-left-color:#6366F1}
.conv-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0;position:relative}
.av-p{background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white}
.av-g{background:linear-gradient(135deg,#22C55E,#16A34A);color:white}
.av-o{background:linear-gradient(135deg,#F59E0B,#D97706);color:white}
.av-r{background:linear-gradient(135deg,#EF4444,#DC2626);color:white}
.online-dot{position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#22C55E;border:2px solid #111118}
.conv-info{flex:1;min-width:0}
.conv-name{font-size:13px;font-weight:600;margin-bottom:2px}
.conv-last{font-size:12px;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.conv-meta{text-align:right;flex-shrink:0}
.conv-time{font-size:10px;color:#6B7280;margin-bottom:4px}
.conv-unread{width:18px;height:18px;border-radius:50%;background:#6366F1;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-left:auto}
.chat{flex:1;display:flex;flex-direction:column}
.chat-header{padding:16px 24px;border-bottom:1px solid #1F1F2E;display:flex;align-items:center;gap:12px}
.chat-user-info h3{font-size:14px;font-weight:600;margin-bottom:1px}
.chat-user-info span{font-size:11px;color:#22C55E}
.messages{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px}
.msg{max-width:70%;display:flex;flex-direction:column;gap:4px}
.msg.sent{align-self:flex-end;align-items:flex-end}
.msg.received{align-self:flex-start}
.msg-bubble{padding:10px 16px;border-radius:18px;font-size:13px;line-height:1.5}
.msg.sent .msg-bubble{background:#6366F1;color:white;border-bottom-right-radius:4px}
.msg.received .msg-bubble{background:#1A1A24;border:1px solid #2D2D3F;border-bottom-left-radius:4px}
.msg-time{font-size:10px;color:#6B7280}
.typing{display:flex;align-items:center;gap:8px;padding:0 24px 16px;font-size:12px;color:#6B7280}
.typing-dots{display:flex;gap:3px}
.typing-dots span{width:5px;height:5px;border-radius:50%;background:#6B7280;animation:blink 1.4s infinite}
.typing-dots span:nth-child(2){animation-delay:.2s}
.typing-dots span:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,80%,100%{opacity:.3}40%{opacity:1}}
.chat-input{padding:16px 24px;border-top:1px solid #1F1F2E;display:flex;align-items:center;gap:10px}
.chat-input input{flex:1;background:#1A1A24;border:1px solid #2D2D3F;border-radius:12px;padding:12px 16px;color:#E5E7EB;font-size:13px;outline:none;font-family:inherit}
.chat-input input:focus{border-color:#6366F1}
.send-btn{width:40px;height:40px;border-radius:50%;background:#6366F1;border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center}
</style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-header"><span class="sidebar-title">Messages</span><button style="background:none;border:1px solid #2D2D3F;border-radius:8px;padding:6px 8px;color:#9CA3AF;cursor:pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z"/></svg></button></div>
  <input class="search" placeholder="Search conversations...">
  <div class="conv-list">
    <div class="conv active"><div class="conv-avatar av-p">S<span class="online-dot"></span></div><div class="conv-info"><div class="conv-name">Sarah Chen</div><div class="conv-last">That sounds great! Let me check the...</div></div><div class="conv-meta"><div class="conv-time">2m</div><div class="conv-unread">3</div></div></div>
    <div class="conv"><div class="conv-avatar av-g">A</div><div class="conv-info"><div class="conv-name">Alex Johnson</div><div class="conv-last">I've pushed the latest changes to main</div></div><div class="conv-meta"><div class="conv-time">1h</div></div></div>
    <div class="conv"><div class="conv-avatar av-o">M<span class="online-dot"></span></div><div class="conv-info"><div class="conv-name">Mike Rivera</div><div class="conv-last">Can you review the PR when you get a chance?</div></div><div class="conv-meta"><div class="conv-time">3h</div><div class="conv-unread">1</div></div></div>
    <div class="conv"><div class="conv-avatar av-r">E</div><div class="conv-info"><div class="conv-name">Emily Park</div><div class="conv-last">The design files are ready for handoff</div></div><div class="conv-meta"><div class="conv-time">1d</div></div></div>
  </div>
</div>
<div class="chat">
  <div class="chat-header"><div class="conv-avatar av-p" style="width:38px;height:38px;font-size:14px">S<span class="online-dot"></span></div><div class="chat-user-info"><h3>Sarah Chen</h3><span>Online</span></div></div>
  <div class="messages">
    <div class="msg received"><div class="msg-bubble">Hey! How's the new feature coming along?</div><div class="msg-time">10:24 AM</div></div>
    <div class="msg sent"><div class="msg-bubble">Going well! Just finished the API integration. Running tests now.</div><div class="msg-time">10:26 AM</div></div>
    <div class="msg received"><div class="msg-bubble">That's awesome! Can you share a preview when it's ready? The team is excited to see it.</div><div class="msg-time">10:28 AM</div></div>
    <div class="msg sent"><div class="msg-bubble">Absolutely! I'll deploy to staging in about 30 minutes. Will send you the link.</div><div class="msg-time">10:30 AM</div></div>
    <div class="msg received"><div class="msg-bubble">That sounds great! Let me check the timeline with the PM and get back to you.</div><div class="msg-time">10:31 AM</div></div>
  </div>
  <div class="typing"><div class="typing-dots"><span></span><span></span><span></span></div>Sarah is typing...</div>
  <div class="chat-input"><input placeholder="Type a message..."><button class="send-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button></div>
</div>
</body></html>`,
  },
};

// Default fallback for unknown prompts
const DEFAULT_TEMPLATE = {
  title: 'Web Application',
  generate: (prompt) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>App</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif;background:#0F172A;color:#E2E8F0;min-height:100vh;display:flex;flex-direction:column}
header{height:60px;background:#1E293B;border-bottom:1px solid #334155;display:flex;align-items:center;padding:0 24px;gap:12px}
header h1{font-size:18px;font-weight:700;background:linear-gradient(135deg,#818CF8,#C084FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
main{flex:1;max-width:800px;width:100%;margin:0 auto;padding:48px 24px;text-align:center}
main h2{font-size:32px;font-weight:800;margin-bottom:12px;background:linear-gradient(135deg,#E2E8F0,#818CF8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
main p{color:#94A3B8;font-size:15px;line-height:1.7;max-width:500px;margin:0 auto 32px}
.btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white;border:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;transition:all .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,.3)}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:40px;text-align:left}
.card{background:#1E293B;border:1px solid #334155;border-radius:14px;padding:20px;transition:all .2s}
.card:hover{border-color:#475569;transform:translateY(-2px)}
.card h3{font-size:14px;font-weight:600;margin-bottom:6px}
.card p{font-size:12px;color:#94A3B8;line-height:1.6}
</style>
</head>
<body>
<header><h1>My App</h1></header>
<main>
  <h2>Welcome to Your App</h2>
  <p>${prompt || 'This is a custom-built application generated by MaterialFlow AI. Edit the code to customize it to your needs.'}</p>
  <button class="btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>Get Started</button>
  <div class="cards">
    <div class="card"><h3>Fast Performance</h3><p>Built with modern web standards for blazing fast load times and smooth interactions.</p></div>
    <div class="card"><h3>Responsive Design</h3><p>Looks great on desktop, tablet, and mobile devices with adaptive layouts.</p></div>
    <div class="card"><h3>Dark Mode</h3><p>Beautiful dark theme that's easy on the eyes with carefully chosen contrast ratios.</p></div>
    <div class="card"><h3>Customizable</h3><p>Edit the generated code directly or describe changes to iterate on the design.</p></div>
  </div>
</main>
</body></html>`,
};

export function generateCode(prompt) {
  const lower = prompt.toLowerCase();

  // Find matching template
  for (const [key, template] of Object.entries(TEMPLATES)) {
    if (template.keywords.some(kw => lower.includes(kw))) {
      const html = template.generate(prompt);
      return {
        html,
        title: template.title,
        description: template.description,
        templateId: key,
      };
    }
  }

  // Fallback: generate generic app
  return {
    html: DEFAULT_TEMPLATE.generate(prompt),
    title: extractTitle(prompt),
    description: `A custom web application built from: "${prompt.slice(0, 80)}"`,
    templateId: 'custom',
  };
}

function extractTitle(prompt) {
  const lower = prompt.toLowerCase();
  // Try to extract a meaningful title
  const patterns = [
    /(?:build|create|make|design)\s+(?:a|an|me|the)?\s*(.{3,30}?)(?:\s+(?:app|application|site|website|page|with|using|that))/i,
    /(?:build|create|make|design)\s+(?:a|an|me|the)?\s*(.{3,30})/i,
  ];
  for (const pat of patterns) {
    const match = prompt.match(pat);
    if (match) {
      return match[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return 'Web Application';
}

export function getTemplateList() {
  return Object.entries(TEMPLATES).map(([id, t]) => ({
    id,
    title: t.title,
    description: t.description,
    keywords: t.keywords,
  }));
}
