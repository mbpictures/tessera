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

FROM node:16-alpine as runner
WORKDIR /ticketshop
ENV NODE_ENV production

COPY --from=builder /ticketshop ./

EXPOSE 3000

ENTRYPOINT npm run build && npm run start:default

