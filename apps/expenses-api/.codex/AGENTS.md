# agents.md (Backend — NestJS + TypeORM)

This file is the working agreement for AI agents and humans contributing to the backend of the Personal Finance App.

## Scope (V1)

Backend responsibilities:

- User authentication (email/password)
- JWT access tokens + **rotating refresh tokens**
- Users (no roles)
- Accounts (Savings + Credit Card)
- Transactions (income/expense/transfer)
- Credit card statement logic (cutoff/due dates, available credit)
- Installments for credit-card purchases (with prepay/cancel)
- Recurring payments (auto-post + manual-due)
- Social: peer transfers (including **dummy users**) + shared debts with settlement history

Non-goals (V1):

- Bank integrations
- Multi-currency
- Email verification
- Roles/permissions beyond “user owns their data”
- Partial debt payments (UI/feature), but settlement history exists

---

## Project conventions

### Tech

- NestJS (modules-first)
- TypeORM (PostgreSQL recommended)
- Migrations: TypeORM migrations (no synchronize in prod)
- Timezone: **America/Bogota**
- Currency: **COP** only (store `currency` column for future, default `COP`)

### Code style

- Prefer small modules: `auth`, `users`, `accounts`, `transactions`, `recurring`, `debts`
- Business logic lives in services; controllers should be thin.
- Use DTOs + validation (class-validator) at the edge.
- Use explicit enums for transaction kinds, account types, recurring types/status.
- Always add or update tests for any production code changes. If tests are not feasible, document why in the PR/notes.

### IDs & timestamps

- Use UUID primary keys.
- Tables should include: `createdAt`, `updatedAt`, optional `deletedAt` (soft delete where appropriate).
- Financial records should prefer “append-only” semantics; if editing transactions is allowed, implement as reversal + new transaction (ledger-friendly).

---

## Security model

### Access token (JWT)

- Short-lived (e.g., 10–15 minutes)
- Contains: `sub` (userId), `email`, `iat`, `exp`
- Signed with `JWT_ACCESS_SECRET`

### Refresh token (rotating)

- Stored server-side as hashed token per session.
- Rotation rules:
  - Each refresh request invalidates the previous refresh token (replace row tokenHash, bump `rotatedAt`)
  - Reuse detection: if an old refresh token is used after rotation, revoke the session.
- Multi-device: each login creates a new session row.

---

## Data ownership & multi-tenancy

- Every record is scoped by `userId` (owner) unless explicitly shared.
- Shared objects (debts) have membership rows that grant access.
- “Dummy users” can exist as placeholders; they also get a default savings account.

---

## API surface (high-level)

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout` (revokes session)
- `GET /auth/me`

### Accounts

- `GET /accounts`
- `POST /accounts` (create credit card or additional savings)
- `GET /accounts/:id`
- `PATCH /accounts/:id`

### Transactions

- `GET /transactions?from=&to=&accountId=&kind=&categoryId=`
- `POST /transactions`
- `PATCH /transactions/:id` (prefer reversal strategy internally)
- `DELETE /transactions/:id` (soft delete)

### Recurring

- `GET /recurring`
- `POST /recurring`
- `PATCH /recurring/:id`
- `POST /recurring/:id/run` (manual trigger, admin/dev)
- `POST /recurring/:id/mark-paid` (manual bills)

### Debts / Social

- `GET /people` (users + dummy users you’ve interacted with)
- `POST /people/dummy`
- `GET /debts`
- `POST /debts`
- `POST /debts/:id/settle` (creates settlement txn + history)
- `GET /debts/:id/history`

---

## Financial logic (V1 rules)

### Account balance (stored)

- Balances are stored and updated transactionally.
- Any write that affects balances must be wrapped in a DB transaction:
  - Insert transaction(s)
  - Update balances (and credit card availability)
  - Insert any derived records (installment schedule items, recurring instances, etc.)

### Transaction kinds

- `INCOME`: +amount to `account.balance`
- `EXPENSE`: -amount from `account.balance` (savings)
- `TRANSFER`: -amount from `fromAccount.balance` and +amount to `toAccount.balance`
- Credit card purchases are modeled as `EXPENSE` on a credit-card account:
  - Update `availableCredit -= amount`
  - Do **not** treat it like cash leaving savings.

### Credit card payment

- Modeled as `TRANSFER` from savings -> credit card account:
  - Savings decreases
  - Credit card “debt” decreases (can be modeled as negative balance or separate aggregates; see DB notes)
  - `availableCredit += paymentAmount` (bounded by credit limit)

### Installments

- A credit-card purchase may have `installmentsTotal >= 1`.
- Statement impact is by installment schedule.
- User can:
  - **prepay** remaining installments (creates a payment event and closes schedule items)
  - **cancel** remaining installments (creates adjustment + closes schedule items)

### Recurring payments

Two types:

- `AUTO_POST`: creates posted transactions on schedule.
- `MANUAL_DUE`: creates due instances; user marks paid to create posted transactions.

---

## Database structure (Mermaid ER diagram)

> Notes:
>
> - This diagram shows V1 tables + relationships.
> - Some derived fields (e.g., statement totals) can be computed in queries; balances are stored.
> - Debt “shared plans” are represented as `Debt` with optional recurrence rules.

```mermaid
erDiagram
  USER ||--o{ AUTH_SESSION : has
  USER ||--o{ ACCOUNT : owns
  USER ||--o{ CATEGORY : owns
  USER ||--o{ TRANSACTION : owns
  USER ||--o{ RECURRING_RULE : owns
  USER ||--o{ CONTACT : owns

  ACCOUNT ||--o{ TRANSACTION : posts
  ACCOUNT ||--|| CREDIT_CARD_PROFILE : may_have
  ACCOUNT ||--o{ CREDIT_CARD_INSTALLMENT_PLAN : has

  CREDIT_CARD_INSTALLMENT_PLAN ||--o{ CREDIT_CARD_INSTALLMENT_ITEM : schedules
  TRANSACTION ||--o| CREDIT_CARD_INSTALLMENT_PLAN : originated_by

  RECURRING_RULE ||--o{ RECURRING_INSTANCE : generates
  RECURRING_INSTANCE ||--o| TRANSACTION : posts_to

  USER ||--o{ DEBT_MEMBERSHIP : member
  DEBT ||--o{ DEBT_MEMBERSHIP : has
  DEBT ||--o{ DEBT_EVENT : history
  DEBT_EVENT ||--o| TRANSACTION : settlement_txn

  %% --- Core entities ---

  USER {
    uuid id PK
    string email "unique"
    string passwordHash
    string displayName
    boolean isDummy "default false"
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }

  AUTH_SESSION {
    uuid id PK
    uuid userId FK
    string refreshTokenHash
    timestamp createdAt
    timestamp lastUsedAt
    timestamp rotatedAt
    timestamp revokedAt
    string userAgent
    string ip
  }

  ACCOUNT {
    uuid id PK
    uuid userId FK
    string type "SAVINGS|CREDIT_CARD"
    string name
    string currency "COP"
    numeric balance "stored; COP"
    boolean isDefault "default false"
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }

  CREDIT_CARD_PROFILE {
    uuid accountId PK, FK
    numeric creditLimit
    numeric availableCredit
    int cutoffDay "1-28/30/31"
    int dueDay "1-28/30/31"
    string nickname
    string last4
    timestamp createdAt
    timestamp updatedAt
  }

  CATEGORY {
    uuid id PK
    uuid userId FK
    string name
    string kind "INCOME|EXPENSE"
    string color
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }

  TRANSACTION {
    uuid id PK
    uuid userId FK
    string kind "INCOME|EXPENSE|TRANSFER"
    uuid accountId FK "primary account"
    uuid fromAccountId FK "nullable; for transfers"
    uuid toAccountId FK "nullable; for transfers"
    uuid categoryId FK "nullable"
    numeric amount
    string currency "COP"
    timestamp occurredAt
    string description
    string payee
    string status "POSTED|VOIDED"
    uuid relatedTransactionId "nullable; refunds/adjustments"
    string idempotencyKey "nullable"
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }

  %% --- Credit card installments ---

  CREDIT_CARD_INSTALLMENT_PLAN {
    uuid id PK
    uuid userId FK
    uuid creditCardAccountId FK
    uuid originatingTransactionId FK
    numeric principalAmount
    int installmentsTotal
    int installmentsRemaining
    string status "ACTIVE|PREPAID|CANCELLED|COMPLETED"
    timestamp createdAt
    timestamp updatedAt
  }

  CREDIT_CARD_INSTALLMENT_ITEM {
    uuid id PK
    uuid planId FK
    int installmentNumber
    numeric amount
    date statementMonth "YYYY-MM-01"
    string status "SCHEDULED|POSTED|CLOSED"
    uuid postedTransactionId FK "nullable"
    timestamp createdAt
    timestamp updatedAt
  }

  %% --- Recurring ---

  RECURRING_RULE {
    uuid id PK
    uuid userId FK
    string type "AUTO_POST|MANUAL_DUE"
    string kind "INCOME|EXPENSE|TRANSFER"
    uuid accountId FK "nullable; for income/expense"
    uuid fromAccountId FK "nullable; for transfer"
    uuid toAccountId FK "nullable; for transfer"
    uuid categoryId FK "nullable"
    numeric amount
    string currency "COP"
    string cadence "MONTHLY|WEEKLY|CUSTOM"
    string cron "nullable"
    date startDate
    date endDate "nullable"
    timestamp nextRunAt
    boolean isActive
    string description
    string payee
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }

  RECURRING_INSTANCE {
    uuid id PK
    uuid ruleId FK
    date scheduledFor
    string status "DUE|POSTED|SKIPPED|CANCELLED"
    uuid postedTransactionId FK "nullable"
    timestamp createdAt
    timestamp updatedAt
  }

  %% --- Social / contacts ---

  CONTACT {
    uuid id PK
    uuid ownerUserId FK
    uuid contactUserId FK "nullable if dummy external"
    string label
    boolean isExternalDummy "default false"
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }

  %% --- Debts ---

  DEBT {
    uuid id PK
    uuid ownerUserId FK "creator"
    string type "IOU|SHARED_PLAN"
    string title
    numeric totalAmount "nullable for plan"
    string currency "COP"
    string status "OPEN|SETTLED|CANCELLED"
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt
  }

  DEBT_MEMBERSHIP {
    uuid id PK
    uuid debtId FK
    uuid userId FK
    string role "OWNER|MEMBER"
    numeric shareAmount "nullable"
    numeric sharePercent "nullable"
    timestamp createdAt
  }

  DEBT_EVENT {
    uuid id PK
    uuid debtId FK
    string type "CREATED|SCHEDULED_DUE|SETTLED|NOTE|CANCELLED"
    uuid createdByUserId FK
    uuid transactionId FK "nullable"
    numeric amount "nullable"
    timestamp occurredAt
    string note
  }
```
