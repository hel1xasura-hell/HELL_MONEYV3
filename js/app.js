/* ============================================================
   HELL MONEY — App Shell
   Vanilla JS SPA. Hash-based routing. RBAC-gated views.
   Swap USE_MOCK to false once api.setBaseUrl() points at Railway.
   ============================================================ */

const state = {
  user: null,            // { username, role }
  route: 'dashboard',
  sidebarOpen: false,
  admins: JSON.parse(localStorage.getItem('hm_admins') || 'null') || [
    { id: 1, username: 'SuperAdmin1', password: 'Password2026', role: 'super_admin', temp: true },
  ],
};

const ROLE_LIMITS = { super_admin: 2, admin: 3 };
const ROLE_LABEL = { super_admin: 'Super Admin', admin: 'Admin' };

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'users', label: 'User Management', icon: 'users' },
  { id: 'economy', label: 'Economy · Taxation', icon: 'coins' },
  { id: 'bank', label: 'Central Bank', icon: 'bank' },
  { id: 'families', label: 'Family System', icon: 'family' },
  { id: 'companies', label: 'Company System', icon: 'building' },
  { id: 'games', label: 'Games Module', icon: 'dice' },
  { id: 'rankings', label: 'Rankings', icon: 'trophy' },
  { id: 'logs', label: 'Logs & Audits', icon: 'scroll' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];

const ICONS = {
  grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="M16.71 13.88.7.71-.71.71"/>',
  bank: '<path d="M3 21h18M4 21V10M20 21V10M2 10l10-6 10 6M6 10v6M10 10v6M14 10v6M18 10v6"/>',
  family: '<circle cx="12" cy="7" r="3"/><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.2"/><circle cx="16" cy="8" r="1.2"/><circle cx="8" cy="16" r="1.2"/><circle cx="16" cy="16" r="1.2"/><circle cx="12" cy="12" r="1.2"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4a3 3 0 0 0 3 6M17 5h3a3 3 0 0 1-3 6"/>',
  scroll: '<path d="M8 21h8a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"/><path d="M14 2v5h5"/><path d="M8 13h6M8 17h4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
};

function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

function saveAdmins() { localStorage.setItem('hm_admins', JSON.stringify(state.admins)); }
function fmtMoney(n) {
  const neg = n < 0;
  const v = Math.abs(n).toLocaleString('en-US');
  return `${neg ? '-' : ''}$${v}`;
}
function isSuper() { return state.user?.role === 'super_admin'; }

// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 mb-3">
            <div class="w-10 h-10 rounded-xl glass glow-ember flex items-center justify-center">
              <span class="font-display font-bold text-ember">$</span>
            </div>
            <span class="font-display text-xl font-bold tracking-tight">HELL MONEY</span>
          </div>
          <p class="text-low text-sm">Admin console for the <span class="text-mid font-medium">lifeverse</span> bot ecosystem</p>
        </div>
        <form id="login-form" class="glass p-6 space-y-4">
          <div>
            <label class="text-xs text-low block mb-1.5">Username</label>
            <input class="field" name="username" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" required />
          </div>
          <div>
            <label class="text-xs text-low block mb-1.5">Password</label>
            <input class="field" name="password" type="password" autocomplete="current-password" required />
          </div>
          <div id="login-error" class="hidden text-xs text-ember bg-[#ff4b3e14] border border-[#ff4b3e33] rounded-lg px-3 py-2"></div>
          <button class="btn btn-primary w-full justify-center" type="submit">
            ${icon('lock', 'w-4 h-4')} Sign in
          </button>
        </form>
        <p class="text-center text-low text-xs mt-5">Access is issued by a Super Admin. No public registration.</p>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const username = fd.get('username').trim();
    const password = fd.get('password').trim();
    const match = state.admins.find((a) => a.username === username && a.password === password);
    const err = document.getElementById('login-error');
    if (!match) {
      err.textContent = 'Invalid username or password.';
      err.classList.remove('hidden');
      return;
    }
    state.user = { id: match.id, username: match.username, role: match.role, temp: !!match.temp };
    sessionStorage.setItem('hm_session', JSON.stringify(state.user));
    state.route = 'dashboard';
    renderApp();
  });
}

function logout() {
  state.user = null;
  sessionStorage.removeItem('hm_session');
  renderLogin();
}

// ---------------------------------------------------------------
// App shell
// ---------------------------------------------------------------
function renderApp() {
  const u = state.user;
  document.getElementById('app').innerHTML = `
    <div id="sidebar-scrim" onclick="toggleSidebar(false)"></div>
    <div class="flex min-h-screen">
      ${renderSidebar()}
      <div class="flex-1 min-w-0 flex flex-col">
        ${renderNavbar()}
        ${renderTicker()}
        <main class="flex-1 p-4 lg:p-6 view" id="main-view"></main>
      </div>
    </div>
  `;
  document.getElementById('sidebar-scrim').classList.toggle('open', state.sidebarOpen);
  renderView();
}

function renderSidebar() {
  const u = state.user;
  return `
  <aside id="sidebar" class="${state.sidebarOpen ? 'open' : ''} w-64 shrink-0 glass glass-tight m-0 lg:m-3 lg:mr-0 border-r lg:border border-line flex flex-col">
    <div class="flex items-center gap-2.5 px-4 py-4 border-b border-line">
      <div class="w-8 h-8 rounded-lg glow-ember flex items-center justify-center bg-obsidian-3" style="background:var(--obsidian-3)">
        <span class="font-display font-bold text-ember text-sm">$</span>
      </div>
      <div>
        <div class="font-display font-bold text-sm leading-none">HELL MONEY</div>
        <div class="text-[10px] text-low mt-0.5">lifeverse console</div>
      </div>
    </div>
    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      ${NAV.map((n) => `
        <div class="nav-item ${state.route === n.id ? 'active' : ''}" onclick="navigate('${n.id}')">
          ${icon(n.icon)}<span>${n.label}</span>
        </div>
      `).join('')}
    </nav>
    <div class="p-3 border-t border-line">
      <div class="glass-tight glass p-3 flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs" style="background:linear-gradient(135deg,var(--ember),var(--gold));color:#1a1206">
          ${u.username.slice(0, 2).toUpperCase()}
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-xs font-semibold truncate">${u.username}</div>
          <div class="text-[10px] ${u.role === 'super_admin' ? 'text-gold' : 'text-mid'}">${ROLE_LABEL[u.role]}</div>
        </div>
        <button onclick="logout()" class="text-low hover:text-ember transition" title="Log out">${icon('logout', 'w-4 h-4')}</button>
      </div>
    </div>
  </aside>`;
}

function renderNavbar() {
  const online = MOCK.overview.webhookOnline;
  return `
  <header class="glass glass-tight m-3 mb-0 px-4 py-3 flex items-center gap-3 border border-line">
    <button class="lg:hidden btn btn-ghost !px-2.5" onclick="toggleSidebar(true)">☰</button>
    <div class="relative flex-1 max-w-md hidden sm:block">
      ${icon('search', 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-low')}
      <input id="global-search" class="field !pl-9" placeholder="Search users, companies, logs…" oninput="handleGlobalSearch(this.value)" />
      <div id="search-results" class="hidden absolute mt-2 w-full glass p-2 z-20 max-h-72 overflow-y-auto"></div>
    </div>
    <div class="flex-1 sm:hidden"></div>
    <div class="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full glass-tight glass">
      <span class="dot ${online ? 'dot-live' : 'dot-down'}"></span>
      <span class="text-mid">${online ? 'Railway bot online' : 'Backend offline'}</span>
    </div>
    <button class="btn btn-ghost !px-2.5 relative">
      ${icon('bell', 'w-4 h-4')}
      <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-ember"></span>
    </button>
  </header>`;
}

function renderTicker() {
  const items = MOCK.transactions.slice(0, 16).map((t) => {
    const credit = t.amount >= 0;
    return `<span class="ledger-item">
      <span class="${credit ? 'credit' : 'debit'}">${credit ? '▲' : '▼'}</span>
      ${t.user} <span class="text-low">${t.type.replace('_',' ')}</span>
      <span class="amt">${fmtMoney(t.amount)}</span>
    </span>`;
  }).join('');
  return `<div class="ledger-ticker mx-3 mt-3 rounded-lg border border-line">
    <div class="ledger-track">${items}${items}</div>
  </div>`;
}

function toggleSidebar(open) {
  state.sidebarOpen = open;
  document.getElementById('sidebar').classList.toggle('open', open);
  document.getElementById('sidebar-scrim').classList.toggle('open', open);
}

function navigate(route) {
  const restricted = ['bank'];
  state.route = route;
  state.sidebarOpen = false;
  renderApp();
}

function handleGlobalSearch(q) {
  const box = document.getElementById('search-results');
  if (!q.trim()) { box.classList.add('hidden'); return; }
  const ql = q.toLowerCase();
  const users = MOCK.users.filter((u) => u.name.toLowerCase().includes(ql) || u.handle.toLowerCase().includes(ql)).slice(0, 4);
  const companies = MOCK.companies.filter((c) => c.name.toLowerCase().includes(ql)).slice(0, 3);
  const families = MOCK.families.filter((f) => f.name.toLowerCase().includes(ql)).slice(0, 3);
  if (!users.length && !companies.length && !families.length) {
    box.innerHTML = `<div class="text-xs text-low p-2">No matches for "${q}"</div>`;
  } else {
    box.innerHTML = [
      users.length ? `<div class="text-[10px] text-low uppercase px-2 pt-1">Users</div>` + users.map(u => `<div class="nav-item" onclick="navigate('users')">${icon('users')}<span>${u.name} <span class="text-low">${u.handle}</span></span></div>`).join('') : '',
      companies.length ? `<div class="text-[10px] text-low uppercase px-2 pt-1">Companies</div>` + companies.map(c => `<div class="nav-item" onclick="navigate('companies')">${icon('building')}<span>${c.name}</span></div>`).join('') : '',
      families.length ? `<div class="text-[10px] text-low uppercase px-2 pt-1">Families</div>` + families.map(f => `<div class="nav-item" onclick="navigate('families')">${icon('family')}<span>${f.name}</span></div>`).join('') : '',
    ].join('');
  }
  box.classList.remove('hidden');
}
document.addEventListener('click', (e) => {
  const box = document.getElementById('search-results');
  if (box && !e.target.closest('#global-search') && !e.target.closest('#search-results')) box.classList.add('hidden');
});

// ---------------------------------------------------------------
// View router
// ---------------------------------------------------------------
function renderView() {
  const el = document.getElementById('main-view');
  el.classList.remove('view'); void el.offsetWidth; el.classList.add('view');
  const views = {
    dashboard: viewDashboard, users: viewUsers, economy: viewEconomy, bank: viewBank,
    families: viewFamilies, companies: viewCompanies, games: viewGames,
    rankings: viewRankings, logs: viewLogs, settings: viewSettings,
  };
  el.innerHTML = (views[state.route] || viewDashboard)();
  afterRender[state.route]?.();
}
const afterRender = {};

function pageHeader(title, sub) {
  return `<div class="mb-5">
    <h1 class="font-display text-xl font-bold">${title}</h1>
    ${sub ? `<p class="text-sm text-low mt-1">${sub}</p>` : ''}
  </div>`;
}
function statCard(label, value, delta, accent = 'ember') {
  const up = delta >= 0;
  return `<div class="glass p-4 hover-lift">
    <div class="text-xs text-low mb-1">${label}</div>
    <div class="font-display text-2xl font-bold">${value}</div>
    <div class="text-xs mt-1 ${up ? 'text-good' : 'text-ember'}" style="color:${up ? '#6fe3a4' : '#ff8078'}">
      ${up ? '▲' : '▼'} ${Math.abs(delta)}% vs last period
    </div>
  </div>`;
}

// ---- Dashboard ----
function viewDashboard() {
  const o = MOCK.overview;
  return `
    ${pageHeader('Dashboard', 'Live snapshot of the lifeverse economy')}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      ${statCard('Total Revenue', fmtMoney(o.totalRevenue), 8.2)}
      ${statCard('Active Users', o.activeUsers.toLocaleString(), 4.1)}
      ${statCard('New Users Today', o.newUsersToday, 12.5)}
      ${statCard('Registered Users', o.totalUsers.toLocaleString(), 2.3)}
    </div>
    <div class="grid lg:grid-cols-3 gap-3 mb-4">
      <div class="glass p-4 lg:col-span-2">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display font-semibold text-sm">Revenue & Active Users</h3>
          <span class="badge badge-mute">Last 12 months</span>
        </div>
        <canvas id="chart-revenue" height="220"></canvas>
      </div>
      <div class="glass p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display font-semibold text-sm">System Status</h3>
        </div>
        <div class="space-y-3">
          ${[
            ['Webhook (Railway)', true], ['SQLite proxy', true], ['Broadcast queue', true], ['Payment gateway', false],
          ].map(([label, ok]) => `
            <div class="flex items-center justify-between text-sm">
              <span class="text-mid">${label}</span>
              <span class="flex items-center gap-1.5"><span class="dot ${ok ? 'dot-live' : 'dot-down'}"></span>${ok ? 'Online' : 'Offline'}</span>
            </div>`).join('')}
        </div>
        <div class="mt-4 pt-4 border-t border-line">
          <div class="text-xs text-low mb-1">Central Bank Supply</div>
          <div class="font-display text-lg font-bold text-gold">${fmtMoney(MOCK.bank.supply)}</div>
        </div>
      </div>
    </div>
    <div class="glass p-4">
      <h3 class="font-display font-semibold text-sm mb-3">Recent Ledger Activity</h3>
      <div class="overflow-x-auto"><table>
        <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Time</th></tr></thead>
        <tbody>${MOCK.transactions.slice(0, 8).map((t) => `
          <tr><td class="strong">${t.user}</td><td class="capitalize">${t.type.replace('_', ' ')}</td>
          <td class="${t.amount >= 0 ? '' : ''}" style="color:${t.amount >= 0 ? '#6fe3a4' : '#ff8078'}">${fmtMoney(t.amount)}</td>
          <td class="text-low">${t.time}</td></tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}
afterRender.dashboard = () => {
  const ctx = document.getElementById('chart-revenue');
  if (!ctx || !window.Chart) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: MOCK.revenueSeries.map((d) => d.month),
      datasets: [
        { label: 'Revenue', data: MOCK.revenueSeries.map((d) => d.revenue), borderColor: '#ff4b3e', backgroundColor: '#ff4b3e22', fill: true, tension: 0.35, yAxisID: 'y' },
        { label: 'Active Users', data: MOCK.revenueSeries.map((d) => d.activeUsers), borderColor: '#e8b86d', backgroundColor: '#e8b86d11', fill: false, tension: 0.35, yAxisID: 'y1' },
      ],
    },
    options: {
      responsive: true, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: '#aab0c0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#6b7182' }, grid: { color: '#1c1f29' } },
        y: { position: 'left', ticks: { color: '#6b7182' }, grid: { color: '#1c1f29' } },
        y1: { position: 'right', ticks: { color: '#6b7182' }, grid: { display: false } },
      },
    },
  });
};

// ---- Users ----
function viewUsers() {
  return `
    ${pageHeader('User Management', 'Search, moderate, and broadcast to lifeverse players')}
    <div class="flex flex-wrap gap-2 mb-4">
      <input id="user-search" class="field max-w-xs" placeholder="Filter by name or handle…" oninput="filterUsers(this.value)" />
      <button class="btn btn-gold ml-auto" onclick="openBroadcast()">${icon('bell', 'w-4 h-4')} Broadcast Suite</button>
    </div>
    <div class="glass p-2 overflow-x-auto">
      <table><thead><tr><th>User</th><th>Telegram ID</th><th>Balance</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead>
      <tbody id="users-tbody">${usersRows(MOCK.users)}</tbody></table>
    </div>
  `;
}
function usersRows(list) {
  return list.slice(0, 20).map((u) => `
    <tr>
      <td class="strong">${u.name} <span class="text-low font-normal">${u.handle}</span></td>
      <td class="font-mono text-xs">${u.telegramId}</td>
      <td style="color:${u.balance >= 0 ? '#e8b86d' : '#ff8078'}">${fmtMoney(u.balance)}</td>
      <td class="capitalize">${u.role.replace('_', ' ')}</td>
      <td><span class="badge ${u.status === 'active' ? 'badge-good' : u.status === 'banned' ? 'badge-ember' : 'badge-mute'}">${u.status}</span></td>
      <td class="text-low">${u.joined}</td>
      <td><button class="btn btn-ghost !py-1 !px-2.5 text-xs" onclick="alert('Would call HellMoneyAPI.users.ban/unban(${u.id}) once backend is connected.')">${u.status === 'banned' ? 'Unban' : 'Ban'}</button></td>
    </tr>`).join('');
}
function filterUsers(q) {
  const ql = q.toLowerCase();
  const filtered = MOCK.users.filter((u) => u.name.toLowerCase().includes(ql) || u.handle.toLowerCase().includes(ql));
  document.getElementById('users-tbody').innerHTML = usersRows(filtered);
}
function openBroadcast() {
  showModal(`
    <h3 class="font-display font-semibold mb-3">Broadcast Suite</h3>
    <div class="space-y-3">
      <select class="field"><option>All users</option><option>Active users only</option><option>Specific family</option><option>Specific company</option></select>
      <textarea class="field" rows="4" placeholder="Write your announcement…"></textarea>
      <div class="flex justify-end gap-2">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="closeModal(); toast('Broadcast queued (mock).')">Send Broadcast</button>
      </div>
    </div>
  `);
}

// ---- Economy ----
function viewEconomy() {
  const t = MOCK.taxConfig;
  return `
    ${pageHeader('Economy System', 'Taxation laws, transaction logs, and wallet analytics')}
    <div class="grid sm:grid-cols-3 gap-3 mb-4">
      ${statCard('Personal Income Tax', t.personalIncomeTax + '%', 0)}
      ${statCard('Corporate Tax', t.corporateTax + '%', 0)}
      ${statCard('Luxury Tax', t.luxuryTax + '%', 0)}
    </div>
    <div class="glass p-4 mb-4 glow-gold">
      <div class="flex items-center gap-2 mb-1">
        <span class="badge badge-gold">Tax-exempt</span>
        <h3 class="font-display font-semibold text-sm">Central Bank Wallet</h3>
      </div>
      <p class="text-xs text-low">The Central Bank wallet belongs to the Super Admin and is permanently exempt from income and corporate tax. All other wallets are taxed automatically on income events.</p>
    </div>
    <div class="glass p-4">
      <h3 class="font-display font-semibold text-sm mb-3">Transaction History</h3>
      <div class="overflow-x-auto"><table>
        <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Amount</th><th>Time</th></tr></thead>
        <tbody>${MOCK.transactions.map((t) => `
          <tr><td class="font-mono text-xs text-low">#${t.id}</td><td class="strong">${t.user}</td>
          <td class="capitalize">${t.type.replace('_', ' ')}</td>
          <td style="color:${t.amount >= 0 ? '#6fe3a4' : '#ff8078'}">${fmtMoney(t.amount)}</td>
          <td class="text-low">${t.time}</td></tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

// ---- Central Bank ----
function viewBank() {
  const b = MOCK.bank;
  return `
    ${pageHeader('Central Bank', 'Money supply, interest rates, and banking audit trail')}
    <div class="grid sm:grid-cols-3 gap-3 mb-4">
      ${statCard('Total Money Supply', fmtMoney(b.supply), 1.4)}
      ${statCard('Loan Interest Rate', b.interestRate + '%', -0.2)}
      ${statCard('Global Tax Rate', b.taxRate + '%', 0)}
    </div>
    <div class="grid lg:grid-cols-2 gap-3 mb-4">
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Adjust Interest Rate</h3>
        <div class="flex items-center gap-3">
          <input type="range" min="0" max="15" step="0.1" value="${b.interestRate}" class="flex-1" oninput="document.getElementById('rate-val').textContent=this.value+'%'">
          <span id="rate-val" class="font-mono text-sm text-gold w-14 text-right">${b.interestRate}%</span>
        </div>
        <button class="btn btn-primary mt-3" onclick="toast('Interest rate update queued (mock).')">Apply Rate</button>
      </div>
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Global Tax Toggle</h3>
        <label class="flex items-center justify-between text-sm">
          <span class="text-mid">Enforce automatic income tax</span>
          <span class="toggle"><input type="checkbox" checked><span class="track"></span></span>
        </label>
        <label class="flex items-center justify-between text-sm mt-3">
          <span class="text-mid">Exempt Central Bank wallet</span>
          <span class="toggle"><input type="checkbox" checked disabled><span class="track"></span></span>
        </label>
      </div>
    </div>
    <div class="glass p-4 mb-4 glow-gold">
      <div class="flex items-center gap-2 mb-1">
        <span class="badge badge-gold">Super Admin &amp; Admin</span>
        <h3 class="font-display font-semibold text-sm">Send Money</h3>
      </div>
      <p class="text-xs text-low mb-3">Sends funds straight from the Central Bank wallet to a player by their Telegram username.</p>
      <form id="send-money-form" class="grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-start">
        <input class="field" name="username" placeholder="@telegram_username" required>
        <input class="field" name="amount" type="number" min="1" step="1" placeholder="Amount ($)" required>
        <button class="btn btn-gold" type="submit">Send</button>
        <input class="field sm:col-span-3" name="note" placeholder="Note (optional) — shown in the audit log">
      </form>
      <div id="send-money-error" class="hidden text-xs text-ember mt-2"></div>
    </div>
    <div class="glass p-4">
      <h3 class="font-display font-semibold text-sm mb-3">Banking Audit Log</h3>
      <div class="space-y-2 font-mono text-xs">
        ${MOCK.adminActions.map((a) => `<div class="flex justify-between border-b border-line-soft pb-2"><span class="text-mid">${a.action}</span><span class="text-low">${a.time}</span></div>`).join('')}
      </div>
    </div>
  `;
}

afterRender.bank = () => {
  const form = document.getElementById('send-money-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Only Super Admin / Admin sessions reach this view at all, but the
    // check is kept explicit here in case more roles are added later.
    if (!['super_admin', 'admin'].includes(state.user.role)) return;
    const fd = new FormData(form);
    let username = fd.get('username').trim();
    const amount = Number(fd.get('amount'));
    const note = fd.get('note').trim();
    const err = document.getElementById('send-money-error');
    err.classList.add('hidden');
    if (!username.startsWith('@')) username = '@' + username;
    if (!amount || amount <= 0) {
      err.textContent = 'Enter a valid amount.';
      err.classList.remove('hidden');
      return;
    }
    // HellMoneyAPI.bank.sendMoney(username, amount, note) once the
    // Railway backend exposes POST /bank/send-money.
    form.reset();
    toast(`Sent ${fmtMoney(amount)} to ${username} from Central Bank (mock).`);
  });
};

// ---- Families ----
function viewFamilies() {
  return `
    ${pageHeader('Family System', 'In-bot families ranked by net worth')}
    <div class="glass p-2 overflow-x-auto">
      <table><thead><tr><th>#</th><th>Family</th><th>Members</th><th>Net Worth</th><th>Founded</th></tr></thead>
      <tbody>${MOCK.families.map((f) => `
        <tr><td class="font-mono text-low">${f.rank}</td><td class="strong">${f.name}</td><td>${f.members}</td>
        <td class="text-gold">${fmtMoney(f.netWorth)}</td><td class="text-low">${f.founded}</td></tr>`).join('')}
      </tbody></table>
    </div>
  `;
}

// ---- Companies ----
function viewCompanies() {
  return `
    ${pageHeader('Company System', 'Business registry, headcount, and corporate tax adjustments')}
    <div class="glass p-2 overflow-x-auto">
      <table><thead><tr><th>Company</th><th>Sector</th><th>Employees</th><th>Revenue</th><th>Tax Adj.</th><th>Founded</th></tr></thead>
      <tbody>${MOCK.companies.map((c) => `
        <tr><td class="strong">${c.name}</td><td>${c.sector}</td><td>${c.employees}</td>
        <td class="text-gold">${fmtMoney(c.revenue)}</td>
        <td style="color:${c.taxAdj >= 0 ? '#ff8078' : '#6fe3a4'}">${c.taxAdj >= 0 ? '+' : ''}${c.taxAdj}%</td>
        <td class="text-low">${c.founded}</td></tr>`).join('')}
      </tbody></table>
    </div>
  `;
}

// ---- Games ----
function viewGames() {
  return `
    ${pageHeader('Games Module', 'Leaderboards, win rates, and reward multipliers')}
    <div class="glass p-2 overflow-x-auto">
      <table><thead><tr><th>Game</th><th>Plays</th><th>Win Rate</th><th>Multiplier</th><th></th></tr></thead>
      <tbody>${MOCK.games.map((g) => `
        <tr><td class="strong">${g.name}</td><td>${g.plays.toLocaleString()}</td><td>${g.winRate}%</td>
        <td class="text-gold">${g.multiplier}x</td>
        <td><input type="range" min="1" max="8" step="0.1" value="${g.multiplier}" class="w-28" oninput="toast('${g.name} multiplier → '+this.value+'x (mock)')"></td></tr>`).join('')}
      </tbody></table>
    </div>
  `;
}

// ---- Rankings ----
function viewRankings() {
  const topUsers = [...MOCK.users].sort((a, b) => b.balance - a.balance).slice(0, 8);
  return `
    ${pageHeader('Rankings', 'Unified leaderboards across the lifeverse economy')}
    <div class="grid lg:grid-cols-3 gap-3">
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Top Users</h3>
        ${topUsers.map((u, i) => rankRow(i + 1, u.name, fmtMoney(u.balance))).join('')}
      </div>
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Top Families</h3>
        ${MOCK.families.map((f, i) => rankRow(i + 1, f.name, fmtMoney(f.netWorth))).join('')}
      </div>
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Top Companies</h3>
        ${[...MOCK.companies].sort((a, b) => b.revenue - a.revenue).map((c, i) => rankRow(i + 1, c.name, fmtMoney(c.revenue))).join('')}
      </div>
    </div>
  `;
}
function rankRow(rank, name, value) {
  return `<div class="flex items-center gap-3 py-2 border-b border-line-soft last:border-0">
    <span class="w-6 text-center font-display font-bold text-xs ${rank <= 3 ? 'text-gold' : 'text-low'}">${rank}</span>
    <span class="flex-1 text-sm truncate">${name}</span>
    <span class="text-xs text-mid font-mono">${value}</span>
  </div>`;
}

// ---- Logs ----
function viewLogs() {
  return `
    ${pageHeader('Logs & Audits', 'System activity, security events, and admin actions')}
    <div class="grid lg:grid-cols-3 gap-3">
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">System Logs</h3>
        <div class="space-y-2 text-xs font-mono">
          ${MOCK.systemLogs.map((l) => `<div class="text-mid border-b border-line-soft pb-2">${l.text}<div class="text-low mt-0.5">${l.time}</div></div>`).join('')}
        </div>
      </div>
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Security Logs</h3>
        <div class="space-y-2 text-xs">
          ${MOCK.securityLogs.map((l) => `<div class="border-b border-line-soft pb-2">
            <span class="badge ${l.level === 'critical' ? 'badge-ember' : l.level === 'warn' ? 'badge-gold' : 'badge-mute'}">${l.level}</span>
            <div class="text-mid mt-1 font-mono">${l.text}</div><div class="text-low mt-0.5">${l.time}</div></div>`).join('')}
        </div>
      </div>
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Admin Actions</h3>
        <div class="space-y-2 text-xs font-mono">
          ${MOCK.adminActions.map((a) => `<div class="border-b border-line-soft pb-2"><span class="text-gold">${a.admin}</span> <span class="text-mid">${a.action}</span><div class="text-low mt-0.5">${a.time}</div></div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// ---- Settings ----
function viewSettings() {
  return `
    ${pageHeader('Settings', 'Account, notifications, and system-level controls')}
    <div class="grid lg:grid-cols-2 gap-3 mb-4">
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Account</h3>
        <div class="text-sm text-mid space-y-2">
          <div class="flex justify-between"><span>Username</span><span class="text-hi">${state.user.username}</span></div>
          <div class="flex justify-between"><span>Role</span><span class="${isSuper() ? 'text-gold' : 'text-hi'}">${ROLE_LABEL[state.user.role]}</span></div>
        </div>
      </div>
      <div class="glass p-4">
        <h3 class="font-display font-semibold text-sm mb-3">Notifications & Maintenance</h3>
        <label class="flex items-center justify-between text-sm mb-3">
          <span class="text-mid">Email digest</span>
          <span class="toggle"><input type="checkbox" checked><span class="track"></span></span>
        </label>
        <label class="flex items-center justify-between text-sm">
          <span class="text-mid">Maintenance mode (bot-wide)</span>
          <span class="toggle"><input type="checkbox" onchange="toast('Maintenance mode '+(this.checked?'enabled':'disabled')+' (mock).')"><span class="track"></span></span>
        </label>
      </div>
    </div>

    ${isSuper() ? `
    <div class="glass p-4 mb-4 glow-violet">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="badge badge-violet">Super Admin only</span>
          <h3 class="font-display font-semibold text-sm">Account Creation Panel</h3>
        </div>
        <button class="btn btn-primary !py-1.5 !text-xs" onclick="openAdminCreate()">+ New Account</button>
      </div>
      <div class="overflow-x-auto"><table>
        <thead><tr><th>Username</th><th>Role</th><th></th></tr></thead>
        <tbody>${state.admins.map((a) => `
          <tr><td class="strong">${a.username} ${a.temp ? '<span class=\"badge badge-ember ml-1\">temp</span>' : ''}</td>
          <td><span class="badge ${a.role === 'super_admin' ? 'badge-gold' : 'badge-mute'}">${ROLE_LABEL[a.role]}</span></td>
          <td><button class="btn btn-danger !py-1 !px-2.5 text-xs" onclick="deleteAdmin(${a.id})">Delete</button></td></tr>`).join('')}
        </tbody></table></div>
      <p class="text-xs text-low mt-3">Limits: max ${ROLE_LIMITS.super_admin} Super Admins, max ${ROLE_LIMITS.admin} Admins. Delete the temporary SuperAdmin1 account once your real account is created.</p>
    </div>

    <div class="glass p-4 glow-ember">
      <div class="flex items-center gap-2 mb-3">
        <span class="badge badge-ember">Super Admin only</span>
        <h3 class="font-display font-semibold text-sm">API & Bot Tokens</h3>
      </div>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-low block mb-1.5">lifeverse Telegram Bot Token</label>
          <input class="field font-mono" type="password" placeholder="123456:ABC-DEF...">
        </div>
        <div>
          <label class="text-xs text-low block mb-1.5">Payment Gateway URL</label>
          <input class="field font-mono" placeholder="https://gateway.example.com/webhook">
        </div>
        <div>
          <label class="text-xs text-low block mb-1.5">Railway Webhook Key</label>
          <input class="field font-mono" type="password" placeholder="whk_live_...">
        </div>
        <div>
          <label class="text-xs text-low block mb-1.5">Backend Base URL (this admin panel)</label>
          <input id="base-url-input" class="field font-mono" placeholder="https://your-app.up.railway.app/api" value="${HellMoneyAPI.getBaseUrl()}">
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button class="btn btn-ghost" onclick="toast('Reverted.')">Discard</button>
          <button class="btn btn-gold" onclick="saveSecrets()">Save Tokens</button>
        </div>
      </div>
    </div>
    ` : `
    <div class="glass p-4 text-center text-sm text-low">
      ${icon('lock', 'w-5 h-5 mx-auto mb-2 text-low')}
      Account creation and API token management are visible to Super Admins only.
    </div>`}
  `;
}

function saveSecrets() {
  const url = document.getElementById('base-url-input').value.trim();
  if (url) HellMoneyAPI.setBaseUrl(url);
  toast('Tokens saved locally (mock). Backend URL updated.');
}

function openAdminCreate() {
  showModal(`
    <h3 class="font-display font-semibold mb-3">Create Admin Account</h3>
    <form id="admin-create-form" class="space-y-3">
      <input class="field" name="username" placeholder="Username" required>
      <input class="field" name="password" type="password" placeholder="Password" required>
      <select class="field" name="role">
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
      <div id="admin-create-error" class="hidden text-xs text-ember"></div>
      <div class="flex justify-end gap-2 pt-1">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" type="submit">Create Account</button>
      </div>
    </form>
  `);
  document.getElementById('admin-create-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const role = fd.get('role');
    const count = state.admins.filter((a) => a.role === role).length;
    if (count >= ROLE_LIMITS[role]) {
      const err = document.getElementById('admin-create-error');
      err.textContent = `Limit reached: max ${ROLE_LIMITS[role]} ${ROLE_LABEL[role]} accounts.`;
      err.classList.remove('hidden');
      return;
    }
    state.admins.push({ id: Date.now(), username: fd.get('username'), password: fd.get('password'), role });
    saveAdmins();
    closeModal();
    renderView();
    toast('Account created.');
  });
}
function deleteAdmin(id) {
  if (state.admins.length <= 1) { toast('At least one account must remain.'); return; }
  state.admins = state.admins.filter((a) => a.id !== id);
  saveAdmins();
  renderView();
}

// ---------------------------------------------------------------
// Modal / toast helpers
// ---------------------------------------------------------------
function showModal(innerHtml) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.id = 'modal-root';
  wrap.onclick = (e) => { if (e.target === wrap) closeModal(); };
  wrap.innerHTML = `<div class="glass p-5 w-full max-w-md">${innerHtml}</div>`;
  document.body.appendChild(wrap);
}
function closeModal() { document.getElementById('modal-root')?.remove(); }

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 glass px-4 py-2.5 text-sm z-[200] glow-gold';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// ---------------------------------------------------------------
// Boot
// ---------------------------------------------------------------
(function boot() {
  const saved = JSON.parse(sessionStorage.getItem('hm_session') || 'null');
  if (saved) { state.user = saved; renderApp(); }
  else renderLogin();
})();
