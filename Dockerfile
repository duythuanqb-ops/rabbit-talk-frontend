# 1. Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# 2. Runtime stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3004
ENV NEXT_PUBLIC_API_URL=http://localhost:3000

EXPOSE 3004

CMD ["node", "server.js"]