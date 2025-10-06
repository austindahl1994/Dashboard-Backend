import { EmbedBuilder } from "discord.js";

export const noCachedBounties = () => {
  const embed = new EmbedBuilder()
    .setTitle("Bounty Event is over!")
    .setColor(0xe74c3c);
  return embed;
};

export const eventNotStartedEmbed = () => {
  const embed = new EmbedBuilder()
    .setTitle("Bounty Event is over!")
    .setColor(0xe74c3c);
  return embed;
};
