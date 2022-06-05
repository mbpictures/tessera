FROM node:16-alpine as deps
RUN apk update
RUN apk add libressl-dev ca-certificates
WORKDIR /ticketshop
COPY package.json package-lock.json ./
RUN npm ci

FROM node:16-alpine as builder
WORKDIR /ticketshop
COPY . .
COPY --from=deps /ticketshop/node_modules ./node_modules
RUN npx prisma generate
RUN sed -i "s|postgresql|sqlite|g" /ticketshop/prisma/schema.prisma
RUN sed -i "s|env(\"DATABASE_URL\")|\"file:./dev.db\"|g" /ticketshop/prisma/schema.prisma
RUN npm run build

FROM node:16-alpine as runner
WORKDIR /ticketshop
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

ENTRYPOINT node server.js

