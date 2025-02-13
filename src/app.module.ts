import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './discord/discord.module';
import { LoggerModule } from './logger/logger.module';
import { WhitelistModule } from './whitelist/whitelist.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DiscordModule,
    LoggerModule,
    WhitelistModule,
    MessagesModule,
  ],
})
export class AppModule {}
