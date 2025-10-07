#!/bin/sh
set -e

# Ensure config directory exists and has correct permissions
mkdir -p /app/config
chmod 755 /app/config

# If whitelist.json exists, ensure it's writable
if [ -f /app/config/whitelist.json ]; then
    chmod 644 /app/config/whitelist.json
fi

# Execute the main command
exec "$@"
