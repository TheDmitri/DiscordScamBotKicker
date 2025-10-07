# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

# Install su-exec for secure user switching
RUN apk add --no-cache su-exec

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/

# Create config directory and set ownership to node user
RUN mkdir -p /app/config && \
    chown -R node:node /app && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Note: Container starts as root to fix volume permissions, then switches to node user
# Use entrypoint script to handle permissions
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["su-exec", "node", "node", "dist/main"]
