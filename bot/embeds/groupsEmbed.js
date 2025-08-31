import { EmbedBuilder } from "discord.js";

export const teams = (teams) => {
  const embed = new EmbedBuilder().setTitle(`Bounty Board Teams`);
  teams.forEach((members, index) => {
    embed.addFields({
      name: `Team ${index + 1}`,
      value: members.join('\n'),
      inline: true
    })
  })
  return [embed];
};
