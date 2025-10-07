import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits, GuildMember, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { WhitelistService } from '../whitelist/whitelist.service';
import { WhitelistedUser } from '../types/whitelist.types';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(DiscordService.name);
  private readonly MINIMUM_ACCOUNT_AGE = 12; // months
  private readonly SCAM_KEYWORDS = [
    'dayz modder',
    'dayz coder',
    'arma 3',
    'arma3',
    'dayz developer',
    'game modder',
    'game developer',
    'mod developer',
    'script developer',
    'fivem dev',
    'assisting dev',
    'building immersive',
    'passionate about scripting',
    'arma reforger',
    'sim racing',
    'flight sim'
  ];

  // Patterns that require multiple game mentions to trigger (reduces false positives)
  private readonly MULTI_GAME_PATTERNS = [
    ['fivem', 'dayz'],
    ['fivem', 'arma'],
    ['dayz', 'arma'],
    ['dayz', 'sim racing'],
    ['arma', 'sim racing']
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly whitelistService: WhitelistService,
    private readonly messagesService: MessagesService,
  ) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  async onModuleInit() {
    this.setupEventListeners();
    await this.connectToDiscord();
  }

  private setupEventListeners() {
    this.client.on('guildMemberAdd', async (member: GuildMember) => {
      await this.handleNewMember(member);
    });

    this.client.on('ready', async () => {
      this.logger.log(`Logged in as ${this.client.user?.tag}`);
      await this.registerCommands();
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      await this.handleCommand(interaction);
    });

    this.client.on('error', (error) => {
      this.logger.error('Discord client error:', error);
    });
  }

  private async connectToDiscord() {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    if (!token) {
      throw new Error('DISCORD_TOKEN is not defined in environment variables');
    }

    try {
      await this.client.login(token);
    } catch (error) {
      this.logger.error('Failed to connect to Discord:', error);
      throw error;
    }
  }

  private async handleNewMember(member: GuildMember) {
    try {
      // Check if user is whitelisted
      if (this.whitelistService.isWhitelisted(member.user.username)) {
        this.logger.log(`Allowing whitelisted user ${member.user.tag} to join`);
        return;
      }

      const accountAge = this.calculateAccountAgeInMonths(member);
      
      // Check account age first
      if (accountAge < this.MINIMUM_ACCOUNT_AGE) {
        await this.kickUser(member, `Account too new (age: ${accountAge} months)`);
        return;
      }

      // For accounts older than 6 months, check profile description for scam patterns
      if (accountAge >= this.MINIMUM_ACCOUNT_AGE) {
        const hasScamPattern = await this.checkProfileForScamPatterns(member);
        if (hasScamPattern) {
          await this.kickUser(member, 'Suspicious profile description detected');
          return;
        }
      }

      this.logger.log(`User ${member.user.tag} joined with acceptable account age: ${accountAge} months`);
    } catch (error) {
      this.logger.error(`Error handling new member ${member.user.tag}:`, error);
    }
  }

  private async checkProfileForScamPatterns(member: GuildMember): Promise<boolean> {
    try {
      // Fetch the full user profile
      const user = await member.user.fetch(true);
      
      // In Discord.js v14, we check the global name, username, and display name
      // Note: Discord's "About Me" is not directly accessible via the API
      // We'll check username, global name, and any custom status
      const displayName = (member.displayName || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      const globalName = (user.globalName || '').toLowerCase();
      
      // Combine all text fields that might contain scam patterns
      const textToCheck = `${displayName} ${username} ${globalName}`.toLowerCase();
      
      if (!textToCheck.trim()) {
        return false;
      }

      // Check if any text contains scam keywords
      const hasScamKeyword = this.SCAM_KEYWORDS.some(keyword => 
        textToCheck.includes(keyword.toLowerCase())
      );

      if (hasScamKeyword) {
        this.logger.warn(`User ${member.user.tag} has suspicious profile (keyword match): "${textToCheck}"`);
        return true;
      }

      // Check for multiple game mentions (common scam pattern)
      const hasMultiGamePattern = this.MULTI_GAME_PATTERNS.some(pattern => {
        return pattern.every(game => textToCheck.includes(game.toLowerCase()));
      });

      if (hasMultiGamePattern) {
        this.logger.warn(`User ${member.user.tag} has suspicious profile (multi-game pattern): "${textToCheck}"`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error checking profile for ${member.user.tag}:`, error);
      return false;
    }
  }

  private async kickUser(member: GuildMember, reason: string): Promise<void> {
    try {
      this.logger.warn(`Kicking user ${member.user.tag} - Reason: ${reason}`);
      
      const kickMessage = this.messagesService.getRandomKickMessage();
      await member.send(kickMessage).catch(() => {
        this.logger.warn(`Could not send DM to ${member.user.tag}`);
      });
      
      await member.kick(reason);
    } catch (error) {
      this.logger.error(`Error kicking user ${member.user.tag}:`, error);
      throw error;
    }
  }

  private calculateAccountAgeInMonths(member: GuildMember): number {
    const now = new Date();
    const createdAt = member.user.createdAt;
    const diffInMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + 
                        (now.getMonth() - createdAt.getMonth());
    return diffInMonths;
  }

  // Whitelist management methods
  async addToWhitelist(username: string, reason: string): Promise<boolean> {
    return this.whitelistService.addToWhitelist(username, reason);
  }

  async removeFromWhitelist(username: string): Promise<boolean> {
    return this.whitelistService.removeFromWhitelist(username);
  }

  async getWhitelistedUsers(): Promise<WhitelistedUser[]> {
    return this.whitelistService.getWhitelistedUsers();
  }

  private async registerCommands(): Promise<void> {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    const clientId = this.client.user?.id;
    
    if (!token || !clientId) {
      this.logger.error('Cannot register commands: missing token or client ID');
      return;
    }

    const commands = [
      new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Manage the whitelist (Owner only)')
        .addSubcommand(subcommand =>
          subcommand
            .setName('add')
            .setDescription('Add a user to the whitelist')
            .addStringOption(option =>
              option
                .setName('username')
                .setDescription('The username to whitelist')
                .setRequired(true)
            )
            .addStringOption(option =>
              option
                .setName('reason')
                .setDescription('Reason for whitelisting')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('remove')
            .setDescription('Remove a user from the whitelist')
            .addStringOption(option =>
              option
                .setName('username')
                .setDescription('The username to remove')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('list')
            .setDescription('List all whitelisted users')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON(),
    ];

    try {
      const rest = new REST({ version: '10' }).setToken(token);
      this.logger.log('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );

      this.logger.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      this.logger.error('Error registering commands:', error);
    }
  }

  private async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const ownerId = this.configService.get<string>('OWNER_DISCORD_ID');
    
    if (!ownerId) {
      await interaction.reply({ content: '❌ Bot owner ID not configured.', ephemeral: true });
      return;
    }

    // Check if the user is the bot owner
    if (interaction.user.id !== ownerId) {
      await interaction.reply({ 
        content: '❌ You do not have permission to use this command. Only the bot owner can manage the whitelist.', 
        ephemeral: true 
      });
      return;
    }

    if (interaction.commandName === 'whitelist') {
      await this.handleWhitelistCommand(interaction);
    }
  }

  private async handleWhitelistCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'add': {
          const username = interaction.options.getString('username', true);
          const reason = interaction.options.getString('reason', true);
          
          this.logger.log(`Attempting to add user "${username}" to whitelist`);
          
          const success = await this.addToWhitelist(username, reason);
          
          if (success) {
            await interaction.reply({ 
              content: `✅ Successfully added **${username}** to the whitelist.\nReason: ${reason}`, 
              ephemeral: true 
            });
          } else {
            // Get current whitelist to show in error
            const currentList = await this.getWhitelistedUsers();
            const existingMatch = currentList.find(u => 
              u.username.toLowerCase().trim() === username.toLowerCase().trim()
            );
            
            if (existingMatch) {
              await interaction.reply({ 
                content: `⚠️ **${username}** is already in the whitelist as "${existingMatch.username}".`, 
                ephemeral: true 
              });
            } else {
              await interaction.reply({ 
                content: `❌ Failed to add **${username}** to the whitelist. Check logs for details.`, 
                ephemeral: true 
              });
            }
          }
          break;
        }

        case 'remove': {
          const username = interaction.options.getString('username', true);
          
          const success = await this.removeFromWhitelist(username);
          
          if (success) {
            await interaction.reply({ 
              content: `✅ Successfully removed **${username}** from the whitelist.`, 
              ephemeral: true 
            });
          } else {
            await interaction.reply({ 
              content: `⚠️ **${username}** was not found in the whitelist.`, 
              ephemeral: true 
            });
          }
          break;
        }

        case 'list': {
          const users = await this.getWhitelistedUsers();
          
          if (users.length === 0) {
            await interaction.reply({ 
              content: '📋 The whitelist is currently empty.', 
              ephemeral: true 
            });
          } else {
            const userList = users
              .map((user, index) => `${index + 1}. **${user.username}** - ${user.reason}`)
              .join('\n');
            
            await interaction.reply({ 
              content: `📋 **Whitelisted Users (${users.length})**\n\n${userList}`, 
              ephemeral: true 
            });
          }
          break;
        }
      }
    } catch (error) {
      this.logger.error('Error handling whitelist command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while processing the command.', 
        ephemeral: true 
      });
    }
  }
}
