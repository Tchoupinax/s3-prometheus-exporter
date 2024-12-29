FROM node:22-alpine as builder

WORKDIR /app

COPY package.json yarn.lock .

RUN yarn

COPY . .

RUN yarn build

###

FROM node:22-alpine

WORKDIR /app

COPY --chown=node:node package.json yarn.lock .

RUN yarn install --production

RUN mkdir src

COPY --chown=node:node --from=builder /app/dist src/

COPY --chown=node:node  config

USER node

CMD node src/index.js
