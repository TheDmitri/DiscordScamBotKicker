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
  private readonly whitelistPath = path.join(process.cwd(), 'config', 'whitelist.json');
  private whitelistedUsers: Set<string> = new Set();

  constructor() {
    this.loadWhitelist();
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
      // Create default whitelist file if it doesn't exist
      await this.saveWhitelist([]);
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
    } catch (error) {
      this.logger.error('Failed to save whitelist:', error);
    }
  }

  async addToWhitelist(username: string, reason: string): Promise<boolean> {
    try {
      const data = await fs.readFile(this.whitelistPath, 'utf8');
      const whitelist: WhitelistData = JSON.parse(data);
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
      const data = await fs.readFile(this.whitelistPath, 'utf8');
      const whitelist: WhitelistData = JSON.parse(data);
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
