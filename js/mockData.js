/* ============================================================
   HELL MONEY — Mock Data
   Stand-in data so the UI is fully alive before a Railway URL
   is configured in Settings → API & Bot Tokens.
   ============================================================ */

const MOCK = (() => {
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[rand(0, arr.length - 1)];

  const firstNames = ['Vex', 'Sable', 'Rook', 'Marrow', 'Cinder', 'Thorne', 'Wraith', 'Ash', 'Nyx', 'Ember', 'Grim', 'Halo', 'Onyx', 'Vesper', 'Kade'];
  const lastNames = ['Blackwood', 'Kane', 'Vane', 'Sinclair', 'Cross', 'Hollow', 'Frost', 'Storm', 'Reyes', 'Voss'];

  function randomUser(id) {
    const name = `${pick(firstNames)}${pick(lastNames)}`;
    return {
      id,
      handle: `@${name.toLowerCase()}${rand(10, 99)}`,
      name: `${name}`,
      telegramId: 500000000 + rand(0, 99999999),
      balance: rand(-2000, 480000),
      status: pick(['active', 'active', 'active', 'banned', 'inactive']),
      role: pick(['citizen', 'citizen', 'citizen', 'ceo', 'family_head']),
      joined: `${rand(2024, 2026)}-${String(rand(1, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}`,
      lastActive: `${rand(0, 72)}h ago`,
    };
  }

  const users = Array.from({ length: 48 }, (_, i) => randomUser(i + 1));

  const families = [
    { id: 1, name: 'House Blackwood', members: 14, netWorth: 4820000, rank: 1, founded: '2025-02-11' },
    { id: 2, name: 'Sable Syndicate', members: 11, netWorth: 3910000, rank: 2, founded: '2025-01-30' },
    { id: 3, name: 'Cross Dominion', members: 9, netWorth: 2740000, rank: 3, founded: '2025-04-19' },
    { id: 4, name: 'The Hollow Court', members: 16, netWorth: 2510000, rank: 4, founded: '2024-12-02' },
    { id: 5, name: 'Vane Consortium', members: 7, netWorth: 1980000, rank: 5, founded: '2025-06-08' },
  ];

  const companies = [
    { id: 1, name: 'Cinderbank Holdings', sector: 'Finance', employees: 34, revenue: 892000, taxAdj: 2, founded: '2025-03-01' },
    { id: 2, name: 'Ashfall Logistics', sector: 'Trade', employees: 21, revenue: 512000, taxAdj: 0, founded: '2025-05-14' },
    { id: 3, name: 'Wraithline Media', sector: 'Media', employees: 12, revenue: 244000, taxAdj: -1, founded: '2025-06-22' },
    { id: 4, name: 'Onyx Extraction Co.', sector: 'Industry', employees: 46, revenue: 1230000, taxAdj: 3, founded: '2024-11-19' },
    { id: 5, name: 'Vesper Arms', sector: 'Manufacturing', employees: 18, revenue: 398000, taxAdj: 1, founded: '2025-07-02' },
  ];

  const games = [
    { id: 'blackjack', name: 'Blackjack', plays: 18420, winRate: 46.2, multiplier: 1.8 },
    { id: 'roulette', name: 'Roulette', plays: 12980, winRate: 47.9, multiplier: 2.0 },
    { id: 'slots', name: 'Slots', plays: 30410, winRate: 38.4, multiplier: 3.2 },
    { id: 'heist', name: 'Bank Heist', plays: 6240, winRate: 21.7, multiplier: 5.0 },
    { id: 'duel', name: 'Duel', plays: 9870, winRate: 50.1, multiplier: 1.9 },
  ];

  const transactions = Array.from({ length: 30 }, (_, i) => {
    const type = pick(['transfer', 'tax', 'game_win', 'game_loss', 'loan', 'salary']);
    const amt = rand(50, 90000);
    const debit = ['tax', 'game_loss', 'loan'].includes(type);
    return {
      id: 9000 + i,
      type,
      user: pick(users).handle,
      amount: debit ? -amt : amt,
      time: `${rand(0, 59)}m ago`,
    };
  }).sort((a, b) => 0);

  const revenueSeries = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    revenue: rand(180000, 620000),
    activeUsers: rand(800, 2600),
  }));

  const securityLogs = [
    { id: 1, level: 'warn', text: 'Repeated failed login for SuperAdmin1 (3 attempts)', time: '4m ago' },
    { id: 2, level: 'info', text: 'New admin session started from 91.22.x.x', time: '19m ago' },
    { id: 3, level: 'critical', text: 'Unusual balance spike flagged on @vexblackwood12', time: '52m ago' },
    { id: 4, level: 'info', text: 'Maintenance mode toggled off', time: '2h ago' },
    { id: 5, level: 'warn', text: 'Rate limit hit on /economy/transactions', time: '3h ago' },
  ];

  const systemLogs = [
    { id: 1, text: 'Webhook heartbeat OK (Railway)', time: '30s ago' },
    { id: 2, text: 'Nightly tax cycle completed — 1,204 wallets processed', time: '6h ago' },
    { id: 3, text: 'Game multiplier updated: Bank Heist → 5.0x', time: '9h ago' },
    { id: 4, text: 'Database backup completed (SQLite snapshot)', time: '11h ago' },
    { id: 5, text: 'Broadcast sent to 2,481 users', time: '1d ago' },
  ];

  const adminActions = [
    { id: 1, admin: 'SuperAdmin1', action: 'Updated Central Bank interest rate to 4.2%', time: '1h ago' },
    { id: 2, admin: 'Admin_Rae', action: 'Issued ban on @rookvane88', time: '3h ago' },
    { id: 3, admin: 'SuperAdmin1', action: 'Created admin account Admin_Kade', time: '1d ago' },
    { id: 4, admin: 'Admin_Rae', action: 'Broadcast: "Weekend tax holiday" sent globally', time: '1d ago' },
  ];

  const activeLoans = [
    { id: 501, user: '@vexblackwood12', amount: 40000, interest: 4.2, termMonths: 6, issued: '2026-04-02', due: '2026-10-02', status: 'active' },
    { id: 502, user: '@sablevane77', amount: 15000, interest: 4.2, termMonths: 3, issued: '2026-05-14', due: '2026-08-14', status: 'active' },
    { id: 503, user: '@rookcross41', amount: 90000, interest: 3.8, termMonths: 12, issued: '2026-01-20', due: '2027-01-20', status: 'active' },
    { id: 504, user: '@ashfrost03', amount: 8000, interest: 4.2, termMonths: 1, issued: '2026-06-01', due: '2026-07-01', status: 'overdue' },
  ];

  return {
    users, families, companies, games, transactions, revenueSeries, activeLoans,
    securityLogs, systemLogs, adminActions,
    bank: { supply: 48_200_000, interestRate: 4.2, taxRate: 12, exemptWallet: 'Central Bank (Super Admin)' },
    taxConfig: { personalIncomeTax: 12, corporateTax: 18, luxuryTax: 25, taxExemptWallets: ['Central Bank'] },
    overview: {
      totalRevenue: 4_812_300,
      activeUsers: 2481,
      newUsersToday: 63,
      totalUsers: users.length * 27,
      webhookOnline: true,
    },
  };
})();
         
