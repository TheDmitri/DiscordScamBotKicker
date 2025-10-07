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

# Create config directory
# Note: .env is mounted as a volume at runtime (see docker-compose.yml)
RUN mkdir -p /app/config

# Copy config files if they exist (optional)
COPY --from=builder /app/config ./config 2>/dev/null || true

# Note: Running as root to ensure write permissions to mounted volumes
# This is acceptable for a single-purpose bot container
CMD ["node", "dist/main"]
