/* ============================================================
   HELL MONEY — API Layer
   Talks to the "lifeverse" Telegram bot backend hosted on Railway.
   This is the ONLY file you need to touch to go from mock data
   to a live backend: set BASE_URL and drop in a real auth token.
   ============================================================ */

const HellMoneyAPI = (() => {

  // 🔧 Plug your Railway deployment URL in here once it's live.
  // Example: "https://lifeverse-bot-production.up.railway.app/api"
  let BASE_URL = localStorage.getItem('hm_base_url') || '';

  // Bearer token issued at login. In mock mode this is a fake token;
  // swap the login() implementation below for a real call once the
  // backend exposes an /auth/login endpoint.
  let AUTH_TOKEN = sessionStorage.getItem('hm_token') || null;

  function setBaseUrl(url) {
    BASE_URL = url;
    localStorage.setItem('hm_base_url', url);
  }

  function setToken(token) {
    AUTH_TOKEN = token;
    if (token) sessionStorage.setItem('hm_token', token);
    else sessionStorage.removeItem('hm_token');
  }

  function headers(extra = {}) {
    return {
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
      ...extra,
    };
  }

  /**
   * Core request wrapper. Falls back to mock mode (throws MockModeError)
   * when no BASE_URL has been configured yet, so the UI can render demo
   * data without a live backend.
   */
  async function request(path, { method = 'GET', body, params } = {}) {
    if (!BASE_URL) {
      throw new MockModeError(`No backend configured — mock mode active for ${path}`);
    }
    const url = new URL(BASE_URL.replace(/\/$/, '') + path);
    if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));

    const res = await fetch(url.toString(), {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      setToken(null);
      window.dispatchEvent(new CustomEvent('hm:unauthorized'));
      throw new Error('Session expired. Please log in again.');
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`API error ${res.status}: ${detail || res.statusText}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  class MockModeError extends Error {}

  // ---------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------
  const auth = {
    async login(username, password) {
      try {
        const data = await request('/auth/login', { method: 'POST', body: { username, password } });
        setToken(data.token);
        return data.user;
      } catch (e) {
        if (e instanceof MockModeError) return null; // handled by mock layer in app.js
        throw e;
      }
    },
    logout() {
      setToken(null);
    },
  };

  // ---------------------------------------------------------------
  // Dashboard / system
  // ---------------------------------------------------------------
  const system = {
    getWebhookStatus: () => request('/system/webhook-status'),
    getOverview: () => request('/system/overview'),
    setMaintenanceMode: (enabled) => request('/system/maintenance', { method: 'POST', body: { enabled } }),
  };

  // ---------------------------------------------------------------
  // Users (Telegram bot players)
  // ---------------------------------------------------------------
  const users = {
    list: (params) => request('/users', { params }),
    get: (id) => request(`/users/${id}`),
    ban: (id, reason) => request(`/users/${id}/ban`, { method: 'POST', body: { reason } }),
    unban: (id) => request(`/users/${id}/unban`, { method: 'POST' }),
    adjustBalance: (id, amount, note) =>
      request(`/users/${id}/balance`, { method: 'POST', body: { amount, note } }),
    broadcast: (payload) => request('/users/broadcast', { method: 'POST', body: payload }),
  };

  // ---------------------------------------------------------------
  // Economy / Central Bank / Taxation
  // ---------------------------------------------------------------
  const economy = {
    getTransactions: (params) => request('/economy/transactions', { params }),
    getWalletAnalytics: () => request('/economy/wallets'),
    getTaxConfig: () => request('/economy/tax-config'),
    updateTaxConfig: (config) => request('/economy/tax-config', { method: 'PUT', body: config }),
  };

  const bank = {
    getSupply: () => request('/bank/supply'),
    setInterestRate: (rate) => request('/bank/interest-rate', { method: 'POST', body: { rate } }),
    setTaxRate: (rate) => request('/bank/tax-rate', { method: 'POST', body: { rate } }),
    getAuditLog: (params) => request('/bank/audit-log', { params }),
    // Sends funds from the Central Bank wallet to a player by Telegram
    // username. Backend should restrict this route to Super Admin / Admin
    // sessions only (checked server-side via the Bearer token's role claim).
    sendMoney: (telegramUsername, amount, note) =>
      request('/bank/send-money', { method: 'POST', body: { telegramUsername, amount, note } }),
    // Issues a loan from the Central Bank to a player by Telegram username.
    // Backend should restrict this to Super Admin / Admin sessions and
    // record it so it shows up in GET /bank/loans afterward.
    giveLoan: (telegramUsername, amount, termMonths, note) =>
      request('/bank/give-loan', { method: 'POST', body: { telegramUsername, amount, termMonths, note } }),
    getLoans: (params) => request('/bank/loans', { params }),
  };

  // ---------------------------------------------------------------
  // Families / Companies / Games / Rankings
  // ---------------------------------------------------------------
  const families = {
    list: (params) => request('/families', { params }),
    get: (id) => request(`/families/${id}`),
  };

  const companies = {
    list: (params) => request('/companies', { params }),
    get: (id) => request(`/companies/${id}`),
    setTaxAdjustment: (id, pct) => request(`/companies/${id}/tax`, { method: 'POST', body: { pct } }),
  };

  const games = {
    leaderboard: (game) => request('/games/leaderboard', { params: { game } }),
    setMultiplier: (game, multiplier) =>
      request(`/games/${game}/multiplier`, { method: 'POST', body: { multiplier } }),
  };

  const rankings = {
    get: (category) => request('/rankings', { params: { category } }),
  };

  // ---------------------------------------------------------------
  // Logs & Audits
  // ---------------------------------------------------------------
  const logs = {
    getSystemLogs: (params) => request('/logs/system', { params }),
    getSecurityLogs: (params) => request('/logs/security', { params }),
    getAdminActions: (params) => request('/logs/admin-actions', { params }),
  };

  // ---------------------------------------------------------------
  // Admin account management (Super Admin only)
  // ---------------------------------------------------------------
  const admins = {
    list: () => request('/admins'),
    create: (payload) => request('/admins', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/admins/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/admins/${id}`, { method: 'DELETE' }),
  };

  // ---------------------------------------------------------------
  // Secrets panel (Super Admin only) — bot token, gateway URLs, etc.
  // ---------------------------------------------------------------
  const secrets = {
    get: () => request('/secrets'),
    update: (payload) => request('/secrets', { method: 'PUT', body: payload }),
  };

  const globalSearch = {
    query: (q) => request('/search', { params: { q } }),
  };

  return {
    MockModeError,
    setBaseUrl, setToken, getBaseUrl: () => BASE_URL,
    auth, system, users, economy, bank, families, companies, games, rankings, logs, admins, secrets, globalSearch,
  };
})();
     
