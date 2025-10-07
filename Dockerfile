# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config

# Create config directory and set permissions
# Note: .env is mounted as a volume at runtime (see docker-compose.yml)
RUN mkdir -p /app/config && chown -R node:node /app

# Switch to non-root user
USER node

CMD ["node", "dist/main"]
