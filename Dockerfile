FROM node:19-alpine as builder

WORKDIR /app
COPY package.json yarn.lock .
RUN yarn
COPY . .
RUN npm run build

###

FROM node:19-alpine

WORKDIR /app

COPY package.json yarn.lock .
RUN yarn install --production
RUN mkdir src
COPY --from=builder /app/dist src/
COPY config config

USER node

CMD node src/index.js
