<div align="center">
  <img src="https://img.shields.io/badge/discord.js-v14-blue.svg" alt="discord.js">
  <img src="https://img.shields.io/badge/nestjs-v10-red.svg" alt="NestJS">
  <img src="https://img.shields.io/badge/typescript-v5-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/docker-ready-brightgreen.svg" alt="Docker">
  <img src="https://img.shields.io/github/workflow/status/TheDmitri/DiscordScamBotKicker/CI/CD" alt="CI/CD">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</div>

<div align="center">
  <h1>Discord Scam Bot Kicker</h1>
  <p><strong>Protect your Discord community from scam accounts with automated moderation</strong></p>
</div>

<p align="center">
  <img src="https://i.imgur.com/8bFOLuJ.png" alt="Discord Bot Banner" width="600">
</p>

## 🛡️ The Problem

Discord communities are increasingly targeted by scam accounts that:
- Join servers with fresh accounts
- Immediately start sending phishing links or scam messages
- Target vulnerable users with fake giveaways, NFT scams, or malware
- Damage community trust and safety

**Manual moderation is time-consuming and ineffective against coordinated attacks.**

## 💡 The Solution

This Discord bot automatically protects your server by:
1. **Detecting new members** with accounts younger than 6 months
2. **Automatically removing** these high-risk accounts
3. **Sending humorous messages** to kicked users with information on how to get whitelisted
4. **Maintaining a whitelist** for trusted users with newer accounts

## ✨ Key Features

- **🔍 Account Age Verification**: Automatically checks the age of new members joining the server
- **👢 Automated Moderation**: Kicks accounts that are less than 6 months old
- **😄 Humorous Messaging**: Sends funny kick messages in Chuck Norris/Bruce Lee style
- **⚪ Whitelist System**: Maintains exceptions for trusted users
- **📊 Comprehensive Logging**: Detailed logs of all actions for monitoring
- **🐳 Docker Support**: Easy deployment with Docker and Docker Compose
- **🔄 CI/CD Integration**: GitHub Actions workflow for testing and deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ or Docker
- Discord Bot Token

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/discord-scam-bot-kicker.git
cd discord-scam-bot-kicker

# Copy the example environment file
cp .env.example .env

# Edit .env and add your Discord bot token
nano .env

# Start the bot
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/discord-scam-bot-kicker.git
cd discord-scam-bot-kicker

# Install dependencies
npm install

# Copy the example environment file
cp .env.example .env

# Edit .env and add your Discord bot token
nano .env

# Start in development mode
npm run start:dev

# Or build and start in production mode
npm run build
npm run start:prod
```

## ⚙️ Configuration

### Discord Developer Portal Setup

1. Create a new application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Go to the "Bot" section and create a bot
3. Copy the bot token and add it to your `.env` file
4. Go to OAuth2 section
5. In URL Generator, select these scopes:
   - `bot`
   - `applications.commands`
6. Select these bot permissions:
   - `Kick Members`
   - `Send Messages`
   - `Read Messages/View Channels`
7. Use the generated URL to invite the bot to your server

### Environment Variables

```
# Discord Bot Token
DISCORD_TOKEN=your_discord_bot_token_here

# Node Environment
NODE_ENV=development
```

### Whitelist Management

The whitelist file is located at `./config/whitelist.json`:

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

You can:
- Edit the file directly - changes will be reflected immediately
- Back up the whitelist by copying the file
- Version control your whitelist if needed

## 🐳 Docker Details

### Docker Compose

```yaml
version: '3'
services:
  discord-bot:
    build: .
    restart: unless-stopped
    volumes:
      - ./config:/app/config
      - ./.env:/app/.env:ro
```

### Volume Management

- `./config:/app/config` - Contains the whitelist file
- `./.env:/app/.env:ro` - Environment file (read-only)

## 📊 Logging

Logs are stored in the container and can be viewed with:
```bash
docker-compose logs -f
```

The container is configured to rotate logs:
- Maximum log file size: 10MB
- Maximum number of log files: 3

## 🔧 Troubleshooting

### Whitelist Issues
If you need to reset the whitelist:
1. Stop the container: `docker-compose down`
2. Delete or edit the whitelist: `./config/whitelist.json`
3. Restart the container: `docker-compose up -d`

### Bot Not Responding
- Verify your Discord token is correct in the `.env` file
- Check if the bot has the required permissions in your Discord server
- View the logs for any error messages: `docker-compose logs -f`

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/TheDmitri">TheDmitri</a></p>
</div>
