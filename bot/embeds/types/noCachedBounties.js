import { EmbedBuilder } from "discord.js";

export const noCachedBounties = () => {
  const embed = new EmbedBuilder().setTitle("There are no current bounties");
  return embed;
};
