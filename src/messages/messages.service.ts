import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesService {
  private readonly whitelistDiscordLink = 'https://discord.gg/3XFGesSnkQ';
  private readonly kickMessages: string[] = [
    "Your account is too young, just like the opponents Chuck Norris roundhouse kicks! Come back in 6 months.",
    "Bruce Lee said 'Be like water', but your account is more like ice - too fresh and needs time to melt. Try again in 6 months!",
    "Chuck Norris counted to infinity... twice. Your account needs to be at least 6 months old, which is way less than infinity!",
    "In the words of Bruce Lee: 'Patience is not passive, it is concentrated strength.' Come back in 6 months when your account is stronger!",
    "Chuck Norris doesn't wear a watch, he decides what time it is. He says your account needs 6 more months!",
    "Your account is getting kicked faster than Bruce Lee's one-inch punch! See you in 6 months.",
    "Chuck Norris can slam a revolving door... Your account is getting slammed for being under 6 months old!",
    "Bruce Lee said 'Be water', but your account is still a snowflake. Come back when it's aged 6 months!",
    "Chuck Norris counted your account age in seconds... it wasn't impressed. Need 6 more months!",
    "Even Bruce Lee had to train for years. Your account needs to train for at least 6 months!"
  ];

  getRandomKickMessage(): string {
    const baseMessage = this.kickMessages[Math.floor(Math.random() * this.kickMessages.length)];
    return `${baseMessage}\n\nHowever, if you believe you should be whitelisted, you can apply here: ${this.whitelistDiscordLink}`;
  }
}
