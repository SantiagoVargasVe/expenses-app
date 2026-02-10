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

## Project layout

- `apps/web`: Vite React client for the expenses UI
- `apps/expenses-api`: API service (NestJS) backing the web app
- `packages/eslint-config`: Shared ESLint configuration
- `packages/typescript-config`: Shared tsconfig bases

## Notes

- Default Node version: `>=18`
- Turborepo orchestrates the scripts; use `pnpm run <script>` from the workspace root.
- The web app uses React Router and TanStack Query; keep async data flows colocated with route modules.
