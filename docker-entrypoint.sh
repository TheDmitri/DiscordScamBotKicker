#!/bin/sh
set -e

# This script runs as root to fix permissions, then switches to node user

# Ensure config directory exists and has correct permissions
mkdir -p /app/config
chown -R node:node /app/config
chmod -R 755 /app/config

# If whitelist.json exists, ensure it's writable by node user
if [ -f /app/config/whitelist.json ]; then
    chown node:node /app/config/whitelist.json
    chmod 644 /app/config/whitelist.json
fi

# Execute the main command
exec "$@"
