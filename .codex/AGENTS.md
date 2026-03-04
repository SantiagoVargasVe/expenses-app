# AGENTS.md

## Setup commands

- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`

## Useful scripts

- Workspace dev only: `pnpm --filter web dev`
- Workspace lint: `pnpm lint`
- Workspace type check: `pnpm check-types`
- Format sources: `pnpm format`
- Always add or update tests for any production code changes. If tests are not feasible, document why in the PR/notes.

## Project layout

- `apps/web`: Vite React client for the expenses UI
- `apps/expenses-api`: API service (NestJS) backing the web app
- `packages/eslint-config`: Shared ESLint configuration
- `packages/typescript-config`: Shared tsconfig bases

## Notes

- Default Node version: `>=18`
- Turborepo orchestrates the scripts; use `pnpm run <script>` from the workspace root.
- The web app uses React Router and TanStack Query; keep async data flows colocated with route modules.

# Backend Roadmap & Agent Execution Guide (MVP)

This document defines the **development roadmap**, execution strategy, and working rules for AI agents and contributors building the Personal Finance App backend (NestJS + TypeORM).

The goal is to:

- Deliver a working MVP through **vertical slices**
- Prioritize **tight feedback loops**
- Ensure every feature is testable end-to-end (FE ↔ BE ↔ DB)
- Reduce ambiguity for AI agents
- Avoid over-engineering early

---

# 🎯 Product Vision (V1)

The app is:

> A COP-only personal finance system with:
>
> - Savings & Credit Card accounts
> - Stored balances
> - Income / Expense / Transfers
> - Credit card statement logic
> - Recurring payments (auto & manual)
> - Social transfers & shared debts

---

# 🧠 Execution Philosophy

## 1️⃣ Vertical Slices Only

Every milestone must include:

- DB migration
- Service logic
- API endpoint(s)
- Minimal working UI (wired to real API)
- Demo script

No backend-only features that cannot be tested visually.

---

## 2️⃣ Stored Balances Rule

Balances are **stored** and updated transactionally.

Every write affecting balances must:

1. Start DB transaction
2. Insert transaction(s)
3. Update account balances
4. Update credit card availability (if applicable)
5. Commit

No partial writes allowed.

---

## 3️⃣ Definition of Done (Non-Negotiable)

Each slice must include:

- Migration added
- DTO validation
- Auth scoping (userId enforced)
- Transactional integrity
- Edge case handling
- Demo script in PR
- No `TODO` in financial logic

---

# 🚀 MVP Roadmap (Step-by-Step)

Each phase is independently testable.

---

# 🟢 Phase 0 — Project Bootstrapping

### Goal

System runs locally and FE can talk to BE.

### Backend

- NestJS setup
- PostgreSQL connection
- TypeORM migrations configured
- `/health` endpoint

### Frontend

- API client wrapper
- Basic layout
- Health ping screen

### Demo

Open app → see backend health status.

---

# 🟢 Phase 1 — Authentication Loop

### Goal

Users can register, login, refresh tokens, logout.

### Backend

- Tables:
  - `user`
  - `auth_session`
- JWT access token (short-lived)
- Rotating refresh tokens (stored hashed)
- `/auth/register`
- `/auth/login`
- `/auth/refresh`
- `/auth/logout`
- `/auth/me`

### Frontend

- Register screen
- Login screen
- Protected routes
- Auto refresh on 401

### Demo Script

1. Register
2. Login
3. Refresh token works
4. Logout invalidates session

---

# 🟢 Phase 2 — Accounts + Stored Balances

### Goal

User sees accounts and balances.

### Backend

- Tables:
  - `account`
  - `credit_card_profile`
- Default savings account created at registration
- Endpoints:
  - `GET /accounts`
  - `POST /accounts` (create credit card)
  - `GET /accounts/:id`

### Frontend

- Accounts list
- Create credit card form
- Account detail screen

### Demo Script

1. Register
2. See default savings
3. Create credit card
4. See card in list

---

# 🟢 Phase 3 — Transactions (Income & Expense)

### Goal

Balances update correctly.

### Backend

- Table:
  - `transaction`
- `POST /transactions`
  - Supports INCOME and EXPENSE
  - Wrapped in DB transaction
- `GET /transactions`

### Frontend

- Add transaction form
- Transaction list per account
- Balance updates live

### Demo Script

1. Add salary → savings increases
2. Add expense → savings decreases
3. Refresh → values persist

This is the first “real finance app” milestone.

---

# 🟢 Phase 4 — Categories

### Goal

Transactions are categorized.

### Backend

- Table:
  - `category`
- CRUD endpoints
- Optional default seed categories

### Frontend

- Categories settings
- Dropdown in transaction form

### Demo Script

1. Create category
2. Add transaction with category
3. Filter by category

---

# 🟢 Phase 5 — Transfers + Credit Card Payments

### Goal

Transfer between accounts works.

### Backend

- `TRANSFER` transaction kind
- Atomic update:
  - decrease fromAccount
  - increase toAccount
- If toAccount is credit card:
  - increase availableCredit (bounded to limit)

### Frontend

- Transfer form
- “Pay credit card” shortcut button

### Demo Script

1. Add credit card purchase
2. Pay card from savings
3. Verify balances + available credit update

---

# 🟢 Phase 6 — Credit Card Purchases (No Installments Yet)

### Goal

Card expenses reduce available credit.

### Backend

- EXPENSE on credit card:
  - reduce availableCredit
  - does NOT affect savings

### Frontend

- Card detail screen
  - limit
  - available credit
  - card transactions list

### Demo Script

1. Add card expense
2. Verify available credit decreases
3. Savings unchanged

---

# 🟢 Phase 7 — Recurring Payments

### Goal

Recurring engine works (manual + auto).

### Backend

- Tables:
  - `recurring_rule`
  - `recurring_instance`
- AUTO_POST:
  - creates posted transaction
- MANUAL_DUE:
  - creates DUE instance
  - posting only when marked paid

### Frontend

- Recurring rules list
- Upcoming dues screen
- Mark as paid action

### Demo Script

1. Create recurring rule
2. Trigger scheduler
3. See due item
4. Mark paid → balance updates

---

# 🟢 Phase 8 — Social Transfers + Dummy Users

### Goal

Send money to non-registered users.

### Backend

- Table:
  - `contact`
- Endpoint to create dummy user
- Transfers to dummy user savings

### Frontend

- People list
- Add person
- Transfer to person

### Demo Script

1. Create dummy “Landlord”
2. Transfer rent
3. See history

---

# 🟢 Phase 9 — Debts + Settlement History

### Goal

Shared debt records exist.

### Backend

- Tables:
  - `debt`
  - `debt_membership`
  - `debt_event`
- Create shared debt
- Settlement creates transfer + event

### Frontend

- Debts list
- Debt detail
- Settle action

### Demo Script

1. Create shared debt
2. Add settlement
3. Both members see history

---

# 🟡 Phase 10 — Installments (Advanced)

Only after previous slices are stable.

### Backend

- `credit_card_installment_plan`
- `credit_card_installment_item`
- Prepay / cancel logic

### Frontend

- Installments tab
- Prepay action

---

# 🧩 How AI Agents Should Work

## Task Size Rule

Prefer:

- 1 table
- 1 endpoint
- 1 screen

Avoid:

- “Implement full credit card module”

---

## PR Template Must Include

- User story
- DB changes
- API contract changes
- Demo script
- Edge cases handled
- Follow-up tasks

---

## Anti-Patterns

❌ Backend-only features without UI  
❌ Silent balance mutations  
❌ Editing transactions without balance correction  
❌ Missing user scoping  
❌ Long-lived refresh tokens without rotation

---

# 🧪 Recommended Development Strategy

## Local Seed Script

Provide:
