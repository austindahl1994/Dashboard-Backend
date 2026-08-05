import { EmbedBuilder } from "discord.js";
import { Colors } from "discord.js";

export const towerCompletion = (rsn, floor, url, firstCompletion, item) => {
  try {
    const title = firstCompletion
      ? `**__${rsn}__** was the first to beat floor **${floor}**!`
      : `**__${rsn}__** has just beaten floor **${floor}**!`;
    const color = firstCompletion ? Colors.Red : Colors.Blue;
    const embeds = [];
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(color)
      .setDescription(`**${rsn}** has just obtained **${item}**!`)
      .setImage(url)
      .setFooter({ text: "Tower of Trials" });
    embeds.push(embed);
    return embeds;
  } catch (error) {
    throw error;
  }
};
