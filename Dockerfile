FROM node:25-alpine AS builder

WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml /app/

RUN pnpm install

COPY . .

RUN pnpm build

###

FROM node:25-alpine

LABEL MAINTAINER="Tchoupinax <corentinfiloche@hotmail.fr>"

WORKDIR /app

RUN adduser --system --uid 1001 s3-prometheus-exporter && \
    addgroup --system --gid 1001 s3-prometheus-exporter

RUN npm i -g pnpm

COPY --chown=node:node package.json pnpm-lock.yaml /app/

RUN pnpm install --production
RUN mkdir src

COPY --chown=node:node --from=builder /app/dist src/
COPY --chown=node:node  config config

USER s3-prometheus-exporter

CMD ["node", "src/index.js"]
