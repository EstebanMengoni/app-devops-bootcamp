FROM node:18.15-alpine as builder
WORKDIR /app
COPY . .
RUN npm install -g npm@9.6.4 --omit-dev
RUN npm install && npm run build

FROM node:18.15-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/test ./test
COPY --from=builder /app/src ./src
COPY package*.json .
COPY tsconfig*.json .
EXPOSE 3000
CMD ["npm", "run", "start:prod"]