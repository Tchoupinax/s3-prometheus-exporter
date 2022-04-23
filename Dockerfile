FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

###

FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

RUN mkdir src
COPY --from=builder /app/dist src/
COPY config config

USER node

CMD node src/index.js