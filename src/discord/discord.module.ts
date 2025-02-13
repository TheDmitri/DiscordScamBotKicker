import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { WhitelistModule } from '../whitelist/whitelist.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [WhitelistModule, MessagesModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
