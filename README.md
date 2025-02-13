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

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Bot**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## Features

- Automatically checks the age of new members joining the server
- Kicks accounts that are less than 6 months old
- Sends a notification message to kicked users
- Comprehensive logging system

## Logging

Logs are stored in the `logs` directory:
- `logs/error.log`: Contains error-level logs
- `logs/combined.log`: Contains all logs

In development mode, logs are also output to the console.

## Docker Support

Build and run using Docker:
```bash
docker build -t discord-scam-bot-kicker .
docker run -d --name discord-bot discord-scam-bot-kicker
```
