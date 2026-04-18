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

COPY package.json package-lock.json ./
RUN npm install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3004
ENV NEXT_PUBLIC_API_URL=http://localhost:3000

EXPOSE 3004

CMD ["npm", "run", "start", "--", "-p", "3004"]