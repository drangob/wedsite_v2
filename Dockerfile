##### DEPENDENCIES

FROM --platform=linux/amd64 oven/bun:latest AS deps
WORKDIR /app

# Install Prisma Client - remove if not using Prisma
COPY prisma ./

# Install dependencies based on the preferred package manager
COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile
##### BUILDER

FROM --platform=linux/amd64 oven/bun:latest AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

RUN SKIP_ENV_VALIDATION=1 bun run build
##### RUNNER

FROM --platform=linux/amd64 oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV production

# Install Prisma CLI globally
RUN bun add -g prisma

# ENV NEXT_TELEMETRY_DISABLED 1
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

COPY prisma ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["bun", "run", "server.js"]
