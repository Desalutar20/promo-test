FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:24-alpine AS production

WORKDIR /app

# Копируем package.json и node_modules из билдера
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Копируем исходники (для tsx runtime)
COPY --from=builder /app/src ./src

# Копируем .env
COPY --from=builder /app/.env .env

EXPOSE 3000

# Запуск через tsx
CMD ["npx", "tsx", "src/server.ts", "--", "--env-file", ".env"]
