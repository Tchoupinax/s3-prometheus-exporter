FROM node:19-alpine as builder

WORKDIR /app

COPY package.json yarn.lock .

RUN yarn

COPY . .

RUN yarn build

###

FROM node:19-alpine

WORKDIR /app

COPY package.json yarn.lock .

RUN yarn install --production

RUN mkdir src

COPY --from=builder /app/dist src/

COPY config config

CMD node src/index.js
