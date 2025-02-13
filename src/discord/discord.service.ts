import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits, GuildMember } from 'discord.js';
import { WhitelistService } from '../whitelist/whitelist.service';
import { WhitelistedUser } from '../types/whitelist.types';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(DiscordService.name);
  private readonly MINIMUM_ACCOUNT_AGE = 6; // months

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

    this.client.on('ready', () => {
      this.logger.log(`Logged in as ${this.client.user?.tag}`);
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
      
      if (accountAge < this.MINIMUM_ACCOUNT_AGE) {
        this.logger.warn(`Kicking user ${member.user.tag} due to new account (age: ${accountAge} months)`);
        
        const kickMessage = this.messagesService.getRandomKickMessage();
        await member.send(kickMessage);
        
        await member.kick('Account too new');
      } else {
        this.logger.log(`User ${member.user.tag} joined with acceptable account age: ${accountAge} months`);
      }
    } catch (error) {
      this.logger.error(`Error handling new member ${member.user.tag}:`, error);
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
}
