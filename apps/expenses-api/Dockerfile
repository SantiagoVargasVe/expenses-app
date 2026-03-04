FROM node:20-alpine AS base

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/expenses-api ./apps/expenses-api

RUN pnpm install --frozen-lockfile
RUN pnpm --filter expenses-api build

WORKDIR /app/apps/expenses-api
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
