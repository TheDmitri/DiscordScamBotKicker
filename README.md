# Discord Scam Bot Kicker

A NestJS-based Discord bot that automatically kicks potential scam accounts based on their account age.

## Setup Instructions

1. **Discord Developer Portal Setup**
   - Create a new application at [Discord Developer Portal](https://discord.com/developers/applications)
   - Go to the "Bot" section and create a bot
   - Copy the bot token and add it to your `.env` file
   - Go to OAuth2 section
   - In URL Generator, select these scopes:
     - `bot`
     - `applications.commands`
   - Select these bot permissions:
     - `Kick Members`
     - `Send Messages`
     - `Read Messages/View Channels`
   - Use the generated URL to invite the bot to your server

2. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your Discord bot token
   nano .env
   ```

3. **Running with Docker (Recommended)**
   ```bash
   # Start the bot
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop the bot
   docker-compose down
   ```

   The whitelist file is located at `./config/whitelist.json`. You can edit it while the bot is running:
   ```json
   {
     "whitelistedUsers": [
       {
         "username": "TrustedUser123",
         "reason": "Trusted member"
       }
     ]
   }
   ```

4. **Running Locally (Development)**
   ```bash
   # Install dependencies
   npm install

   # Start in development mode
   npm run start:dev
   
   # Start in production mode
   npm run build
   npm run start:prod
   ```

## Features

- Automatically checks the age of new members joining the server
- Kicks accounts that are less than 6 months old
- Sends a funny kick message in Chuck Norris/Bruce Lee style
- Provides whitelist application information
- Comprehensive logging system
- Easy whitelist management through volume mapping

## Whitelist Management

The whitelist file is mapped to your local machine at `./config/whitelist.json`. You can:
1. Edit the file directly - changes will be reflected immediately
2. Back up the whitelist by copying the file
3. Version control your whitelist if needed

## Logging

Logs are stored in the container and can be viewed with:
```bash
docker-compose logs -f
```

The container is configured to rotate logs:
- Maximum log file size: 10MB
- Maximum number of log files: 3

## Docker Volume Management

The following volumes are mapped:
- `./config:/app/config` - Contains the whitelist file
- `./.env:/app/.env:ro` - Environment file (read-only)

## Troubleshooting

If you need to reset the whitelist:
1. Stop the container: `docker-compose down`
2. Delete or edit the whitelist: `./config/whitelist.json`
3. Restart the container: `docker-compose up -d`
