# HELL MONEY — Admin Console for `lifeverse`

A static, GitHub-Pages-ready admin panel for the `lifeverse` Telegram bot. No
build step, no database driver in the browser — this is pure HTML/CSS/JS that
talks to your Railway backend over REST once you wire it up.

## Structure

```
hell_money/
├── index.html          # SPA shell — loads the three scripts below in order
├── css/
│   └── styles.css       # Design tokens, glass panels, ledger ticker, components
├── js/
│   ├── mockData.js       # Demo data so the UI works with zero backend
│   ├── api.js             # REST client — the ONLY file you edit to go live
│   └── app.js              # Auth, RBAC, routing, view rendering
└── README.md
```

## Running it

Just open `index.html` in a browser, or serve the folder statically
(GitHub Pages, Netlify, `python -m http.server`, etc). There is nothing to
compile.

## First login

```
Username: SuperAdmin1
Password: Password2026
```

This is a **temporary Super Admin account**, stored client-side for the demo.
Once you're in:
1. Go to **Settings → Account Creation Panel**.
2. Create your real Super Admin account.
3. Delete `SuperAdmin1`.

Role limits are enforced in the UI: **max 2 Super Admins, max 3 Admins**.
Non-Super-Admins never see the Account Creation Panel or the API & Bot
Tokens panel — those sections are omitted from the DOM entirely for that
role, not just hidden with CSS.

> ⚠️ This is a frontend mock. Accounts, balances, and logs are demo data
> held in `localStorage`/memory. Real authentication, password hashing, and
> persistence must live on your Railway backend — see below.

## Connecting your Railway backend

Everything the frontend needs from your bot goes through `js/api.js`. It
exposes a single `HellMoneyAPI` object with namespaced methods:

```js
HellMoneyAPI.setBaseUrl('https://your-app.up.railway.app/api');

await HellMoneyAPI.users.list({ status: 'active' });
await HellMoneyAPI.economy.getTransactions();
await HellMoneyAPI.bank.setInterestRate(4.5);
await HellMoneyAPI.admins.create({ username, password, role });
```

Every call automatically attaches:
```
Authorization: Bearer <token from login>
Content-Type: application/json
```

Until a base URL is set (Settings → API & Bot Tokens → Backend Base URL),
`api.js` throws a `MockModeError` internally and the UI falls back to
`mockData.js` so you always have something to look at.

### Suggested backend routes

| Area | Routes |
|---|---|
| Auth | `POST /auth/login` |
| System | `GET /system/webhook-status`, `GET /system/overview`, `POST /system/maintenance` |
| Users | `GET /users`, `GET /users/:id`, `POST /users/:id/ban`, `POST /users/:id/balance`, `POST /users/broadcast` |
| Economy | `GET /economy/transactions`, `GET /economy/wallets`, `GET|PUT /economy/tax-config` |
| Bank | `GET /bank/supply`, `POST /bank/interest-rate`, `POST /bank/tax-rate`, `GET /bank/audit-log`, `POST /bank/send-money` (Super Admin/Admin only, checked server-side) |
| Families / Companies | `GET /families`, `GET /companies`, `POST /companies/:id/tax` |
| Games | `GET /games/leaderboard`, `POST /games/:id/multiplier` |
| Logs | `GET /logs/system`, `GET /logs/security`, `GET /logs/admin-actions` |
| Admins | `GET|POST /admins`, `PUT|DELETE /admins/:id` |
| Secrets | `GET|PUT /secrets` (bot token, gateway URL, webhook key) |

Your Railway service should own the SQLite database and be the only thing
that ever sees the real bot token — the frontend just calls the proxy.

## Design notes

- **Palette**: obsidian base (`#07080b–#191c26`) with ember red (`#ff4b3e`)
  as the primary action/danger accent and gold (`#e8b86d`) for money and
  Super-Admin-only surfaces; violet is reserved for RBAC-restricted panels.
- **Type**: Sora for display/headings, Inter for body, JetBrains Mono for
  ledger figures, IDs, and logs.
- **Signature element**: the ledger ticker under the navbar — a continuous,
  pausable stream of live-looking transactions in mono type, echoing a
  stock ticker but themed to the bot's economy.
- Respects `prefers-reduced-motion` (ticker and pulse animations disable).
