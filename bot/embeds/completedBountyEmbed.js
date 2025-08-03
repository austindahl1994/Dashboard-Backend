import { EmbedBuilder } from "discord.js";

// Some sort of list for the description for different players?
export const completedBountyEmbed = (bounty) => {
  const embed = new EmbedBuilder()
    .setTitle(`${bounty.Difficulty} has been claimed by ${bounty.RSN}`)
    // code for comparing either RSN or Discord
    .setImage(bounty.S3_URL)
    .setDescription("Some completion description here, can be specific based on RSN || some default message");
    // finish embed with ';' symbol
    // can add footer or something as well based on RSN
  return embed
}
