# Expenses App TODO

This file tracks completed work and remaining work. Mark items as done by changing `[ ]` to `[x]`.

## Status Summary

- Last updated: 2026-03-03
- Source of truth: `/.codex/AGENTS.md`, `/apps/expenses-api/.codex/AGENTS.md`, `/apps/web/.codex/AGENTS.md`

## Completed

- [x] Monorepo setup with `pnpm` + `turbo`
- [x] Web app scaffold (Vite + React + Router)
- [x] Backend scaffold (NestJS)
- [x] API client wrapper in web app
- [x] Auth UI (login + signup)
- [x] Auth API (register + login) with JWT access token
- [x] Basic backend tests exist (auth + app controller + drizzle service)

## Remaining (Planned)

### Foundation / Alignment

- [ ] Decide and align ORM/migrations strategy
- [ ] Add `/health` endpoint in API and health check screen in web
- [ ] Ensure database config for local dev (env vars, docs)
- [ ] Define consistent error response format (API + UI handling)

### Phase 1 — Auth (complete the loop)

- [ ] Add `auth_session` table for rotating refresh tokens
- [x] Add `auth_session` table for rotating refresh tokens
- [x] Implement `/auth/refresh`, `/auth/logout`, `/auth/me`
- [x] Implement refresh token rotation + reuse detection
- [ ] Add auth E2E happy-path tests
- [x] Add UI auto-refresh on 401 + persisted auth state

### Phase 2 — Accounts + Stored Balances

- [ ] Migrations and models: `account`, `credit_card_profile`
- [x] Migrations and models: `account`, `credit_card_profile`
- [x] Create default savings account on registration
- [x] Endpoints: `GET /accounts`, `POST /accounts`, `GET /accounts/:id`
- [x] UI: accounts list, create credit card, account detail
- [ ] Transactional balance updates and tests

### Phase 3 — Transactions (income/expense/transfer)

- [x] Migrations and models: `transaction`, `category`
- [x] Endpoints: `GET /transactions`, `POST /transactions`, `PATCH /transactions`, `DELETE /transactions`
- [x] Implement balance updates per transaction kind
- [x] UI: transaction list + create form
- [x] Tests for transaction creation and balance effects

### Phase 4 — Credit Card Statements + Installments

- [x] Models: `credit_card_installment_plan`, `credit_card_installment_item`
- [x] Statement logic (cutoff/due dates, available credit)
- [x] Installment purchase flow + prepay/cancel
- [x] UI: statement summary + installment management
- [x] Tests for installment scheduling + credit availability

### Phase 5 — Recurring Payments

- [x] Models: `recurring_rule`, `recurring_instance`
- [x] Endpoints: `GET/POST/PATCH /recurring`, `/recurring/:id/run`, `/recurring/:id/mark-paid`
- [x] Scheduler or manual trigger for AUTO_POST
- [x] UI: recurring list + create/edit
- [x] Tests for rule generation and manual due flow

### Phase 6 — Debts / Social

- [x] Models: `contact`, `debt`, `debt_membership`, `debt_event`
- [x] Endpoints: `GET /people`, `POST /people/dummy`, `GET/POST /debts`, `/debts/:id/settle`, `/debts/:id/history`
- [x] UI: people list, debts list, debt detail, settlement flow
- [x] Tests for settlements and shared access rules

### Cross-cutting

- [ ] Authorization guards on all user-scoped endpoints
- [x] Input validation with DTOs/Zod + error mapping to UI
- [ ] Add seed/demo script per slice
- [ ] Expand test coverage per feature (unit + integration)
