# Web Agent Guide

## Quick start

- Install workspace deps: `pnpm install`
- Start the web dev server: `pnpm --filter web dev`
- Build for production: `pnpm --filter web build`
- Preview the build output: `pnpm --filter web preview`

## Linting & formatting

- Run lint rules: `pnpm --filter web lint`
- Format sources: `pnpm format`
- Type check (workspace wide): `pnpm check-types`
- Always add or update tests for any production code changes. If tests are not feasible, document why in the PR/notes.

## Key paths

- `apps/web/src/main.tsx`: Entry point; mounts the router into the DOM.
- `apps/web/src/router.tsx`: Route map—import new routes here.
- `apps/web/src/modules/*`: Feature modules; colocate screens, hooks, and UI.
- `apps/web/src/modules/shared/ui`: Shared UI primitives (buttons, cards, layouts).
- `apps/web/src/index.css`: Tailwind v4 design tokens and global styles.

## Architecture notes

- React 19 + Vite handle rendering and bundling.
- React Router 7 manages navigation; compose `RouteObject`s per module.
- TanStack Query is available for async data—prefer hooks in `modules/shared/hooks`.
- Tailwind 4 (via `@tailwindcss/vite`) powers styling; reuse tokens defined in `index.css`.
- Forms lean on TanStack Form for state plus Zod for schema validation.
- Component primitives follow shadcn/ui patterns themed with Tailwind tokens.

## Adding features

- Generate a folder under `src/modules/<feature>` for route code and UI.
- Export a `RouteObject` (see `modules/auth/route.tsx`) and register it in `src/router.tsx`.
- Keep API access in hooks; share them via `modules/shared`.
- Define Zod schemas alongside features (or shared) and wire them into TanStack Form.
- No test setup yet—when adding tests, follow Vitest + React Testing Library.

## Design system details

- Design tokens live in `src/index.css` under the `@theme` block; extend tokens there first.
- Colors, typography, spacing, radii, and shadows mirror the product design system.
- Favor Tailwind arbitrary values referencing tokens (`text-[theme(--text-body)]`, etc.).
- Build form UIs with shadcn components, controlled by TanStack Form controllers.
- Place reusable schema definitions in `modules/shared` to keep validation consistent.
