FROM node:26.13.1-alpine@sha256:f56092a5d85c32beef14de944aaa0110193ef1ae85205036c5d40d8aece58759 AS builder

WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

###

FROM node:26.13.1-alpine@sha256:f56092a5d85c32beef14de944aaa0110193ef1ae85205036c5d40d8aece58759

LABEL MAINTAINER="Tchoupinax <corentinfiloche@hotmail.fr>"

WORKDIR /app

RUN adduser --system --uid 1001 s3-prometheus-exporter && \
    addgroup --system --gid 1001 s3-prometheus-exporter

RUN npm i -g pnpm

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

RUN pnpm install --production --frozen-lockfile
RUN mkdir src

COPY --chown=node:node --from=builder /app/dist src/
COPY --chown=node:node  config config

USER s3-prometheus-exporter

CMD ["node", "src/index.mjs"]
