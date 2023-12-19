FROM node:16-alpine as deps
RUN apk update
RUN apk add libressl-dev ca-certificates
WORKDIR /ticketshop
COPY package.json package-lock.json ./
RUN npm ci

FROM node:16-alpine as builder
RUN apk add --update --no-cache openssl1.1-compat
WORKDIR /ticketshop
COPY . .
COPY --from=deps /ticketshop/node_modules ./node_modules
# We need to use encapsulated SQLite Database for building and replace it later on by postgres
RUN sed -i "s|postgresql|sqlite|g" /ticketshop/prisma/schema.prisma
RUN sed -i "s|env(\"DATABASE_URL\")|\"file:./dev.db\"|g" /ticketshop/prisma/schema.prisma
RUN npx prisma db push
ENV DATABASE_URL=file:./dev.db
ENV NEXT_TELEMETRY_DISABLED=1
RUN printf 'NEXT_PUBLIC_NEXTAUTH_PATH=/api/admin/auth \nNEXTAUTH_URL=http://localhost:3000/api/admin/auth' >> ./.env
RUN npm run build

FROM node:16-alpine as runner
WORKDIR /ticketshop
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /ticketshop/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /ticketshop/.next/standalone ./
RUN sed -i "s|sqlite|postgresql|g" /ticketshop/node_modules/.prisma/client/schema.prisma
RUN sed -i "s|\"file:./dev.db\"|env(\"DATABASE_URL\")|g" /ticketshop/node_modules/.prisma/client/schema.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

ENTRYPOINT node server.js

