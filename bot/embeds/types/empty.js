import { EmbedBuilder } from "discord.js";

export const empty = () => {
  const embed = new EmbedBuilder().setTitle("Unkown type of task completed");
  return embed;
};
