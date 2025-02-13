import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { WhitelistedUser } from '../types/whitelist.types';

interface WhitelistData {
  whitelistedUsers: WhitelistedUser[];
}

@Injectable()
export class WhitelistService {
  private readonly logger = new Logger(WhitelistService.name);
  private readonly whitelistPath: string;
  private whitelistedUsers: Set<string> = new Set();

  constructor() {
    // Use environment-aware path
    this.whitelistPath = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'config', 'whitelist.json')
      : path.join(process.cwd(), 'config', 'whitelist.json');
    
    this.initializeWhitelist();
  }

  private async initializeWhitelist(): Promise<void> {
    try {
      await this.loadWhitelist();
    } catch (error) {
      this.logger.warn('Whitelist file not found, creating default whitelist');
      await this.createDefaultWhitelist();
    }
  }

  private async createDefaultWhitelist(): Promise<void> {
    const defaultWhitelist: WhitelistData = {
      whitelistedUsers: []
    };

    try {
      await fs.mkdir(path.dirname(this.whitelistPath), { recursive: true });
      await fs.writeFile(
        this.whitelistPath,
        JSON.stringify(defaultWhitelist, null, 2),
        { encoding: 'utf8' }
      );
      this.whitelistedUsers = new Set();
      this.logger.log('Created default whitelist file');
    } catch (error) {
      this.logger.error('Failed to create default whitelist:', error);
      throw error;
    }
  }

  private async loadWhitelist(): Promise<void> {
    try {
      const data = await fs.readFile(this.whitelistPath, 'utf8');
      const whitelist: WhitelistData = JSON.parse(data);
      this.whitelistedUsers = new Set(
        whitelist.whitelistedUsers.map((user: WhitelistedUser) => user.username.toLowerCase())
      );
      this.logger.log(`Loaded ${this.whitelistedUsers.size} whitelisted users`);
    } catch (error) {
      this.logger.error('Failed to load whitelist:', error);
      throw error;
    }
  }

  private async saveWhitelist(users: WhitelistedUser[]): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.whitelistPath), { recursive: true });
      const whitelist: WhitelistData = { whitelistedUsers: users };
      await fs.writeFile(
        this.whitelistPath,
        JSON.stringify(whitelist, null, 2)
      );
      this.whitelistedUsers = new Set(users.map((user: WhitelistedUser) => user.username.toLowerCase()));
      this.logger.log('Whitelist saved successfully');
    } catch (error) {
      this.logger.error('Failed to save whitelist:', error);
      throw error;
    }
  }

  async addToWhitelist(username: string, reason: string): Promise<boolean> {
    try {
      let whitelist: WhitelistData;
      try {
        const data = await fs.readFile(this.whitelistPath, 'utf8');
        whitelist = JSON.parse(data);
      } catch (error) {
        whitelist = { whitelistedUsers: [] };
      }

      const normalizedUsername = username.toLowerCase();
      
      if (!whitelist.whitelistedUsers.some((user: WhitelistedUser) => 
        user.username.toLowerCase() === normalizedUsername
      )) {
        whitelist.whitelistedUsers.push({ username, reason });
        await this.saveWhitelist(whitelist.whitelistedUsers);
        this.logger.log(`Added user ${username} to whitelist`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to add user to whitelist:', error);
      return false;
    }
  }

  async removeFromWhitelist(username: string): Promise<boolean> {
    try {
      let whitelist: WhitelistData;
      try {
        const data = await fs.readFile(this.whitelistPath, 'utf8');
        whitelist = JSON.parse(data);
      } catch (error) {
        return false;
      }

      const normalizedUsername = username.toLowerCase();
      const initialLength = whitelist.whitelistedUsers.length;
      
      whitelist.whitelistedUsers = whitelist.whitelistedUsers.filter(
        (user: WhitelistedUser) => user.username.toLowerCase() !== normalizedUsername
      );
      
      if (initialLength !== whitelist.whitelistedUsers.length) {
        await this.saveWhitelist(whitelist.whitelistedUsers);
        this.logger.log(`Removed user ${username} from whitelist`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to remove user from whitelist:', error);
      return false;
    }
  }

  isWhitelisted(username: string): boolean {
    return this.whitelistedUsers.has(username.toLowerCase());
  }

  async getWhitelistedUsers(): Promise<WhitelistedUser[]> {
    try {
      const data = await fs.readFile(this.whitelistPath, 'utf8');
      const whitelist: WhitelistData = JSON.parse(data);
      return whitelist.whitelistedUsers;
    } catch (error) {
      this.logger.error('Failed to get whitelisted users:', error);
      return [];
    }
  }
}
