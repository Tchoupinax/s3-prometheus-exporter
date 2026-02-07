FROM node:25-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn

COPY . .

RUN yarn build

###

FROM node:25-alpine

WORKDIR /app

COPY --chown=node:node package.json yarn.lock /app/

RUN yarn install --production

RUN mkdir src

COPY --chown=node:node --from=builder /app/dist src/

COPY --chown=node:node  config config

USER node

CMD node src/index.js
