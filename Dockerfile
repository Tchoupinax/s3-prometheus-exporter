FROM node:25-alpine AS builder

WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml /app/

RUN pnpm install

COPY . .

RUN pnpm build

###

FROM node:25-alpine

WORKDIR /app

RUN npm i -g pnpm

COPY --chown=node:node package.json pnpm-lock.yaml /app/

RUN pnpm install --production
RUN mkdir src

COPY --chown=node:node --from=builder /app/dist src/
COPY --chown=node:node  config config

USER node

CMD node src/index.js
