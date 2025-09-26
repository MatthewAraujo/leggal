# Etapa 1: build
FROM node:22.8.0-slim AS builder

RUN apt-get update -y && apt-get install -y openssl libssl-dev procps

WORKDIR /app

# Copiar apenas arquivos de dependência primeiro (melhora cache do Docker)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copiar resto do código
COPY . .

# Build do NestJS
RUN npm run build

# Gera o client do Prisma
RUN npx prisma generate


# Etapa 2: runtime
FROM node:22.8.0-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl-dev procps

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3333
CMD npx prisma migrate deploy && node dist/src/infra/main.js

