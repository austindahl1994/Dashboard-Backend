import { EmbedBuilder } from "discord.js";

export const noCachedBounties = () => {
  const embed = new EmbedBuilder()
    .setTitle("There are no current bounties")
    .setColor(0xe74c3c);
  return embed;
};

export const eventNotStartedEmbed = () => {
  const embed = new EmbedBuilder()
    .setTitle("The event has not started yet")
    .setColor(0xe74c3c);
  return embed;
};
