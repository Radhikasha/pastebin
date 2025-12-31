# Multi-stage build
FROM node:18-alpine as builder

# Frontend build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Backend build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/server.js ./
COPY --from=builder /app/frontend/build ./public

EXPOSE 5000
CMD ["node", "server.js"]
