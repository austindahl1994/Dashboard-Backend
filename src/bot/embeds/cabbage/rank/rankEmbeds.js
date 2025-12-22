import { EmbedBuilder } from "discord.js";
import { Colors } from "discord.js";

const colors = [Colors.Green, Colors.Blue, Colors.Gold];

const createThumbnail = (rank) => {
  return `https://oldschool.runescape.wiki/images/Clan_icon_-_${rank}.png`;
};
// rank embed will expect array of:
// Title, description (by having X, you've achieved Y rank, but are lacking Z for the next tier), list (achieved/lacking), thumbnail png
// [{title, description, list, thumbnail}]
const temp = ["PvM", "Skilling", "Hybrid"];
export const rankEmbed = (ranks) => {
  try {
    const embeds = [];
    ranks.forEach((rankObj, index) => {
      const embed = new EmbedBuilder()
        .setTitle(`**__${rankObj.title}__**`)
        .setColor(colors[index])
        .setAuthor({
          name: temp[index],
          iconURL: createThumbnail(rankObj.rank),
        })
        // .setThumbnail(createThumbnail(rankObj.rank))
        .setDescription(rankObj.description);
      rankObj.details.forEach((detail) => {
        embed.addFields({
          name: `**__${detail.header}__**`,
          value: detail.fields.join("\n"),
          inline: true,
        });
      });
      embeds.push(embed);
    });
    return embeds;
  } catch (error) {
    throw error;
  }
};

export const pathEmbed = (user, rsn, path) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle(
        `**${user}** (RSN: __${rsn}__) has applied for **${path.toUpperCase()}** rank!`
      )
      .setColor(Colors.Purple);
    return embed;
  } catch (error) {
    throw error;
  }
};

export const noteEmbed = () => {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`**__NOTE:__** This is just a rank check, no application sent!`)
      .setColor(Colors.White);
    return embed;
  } catch (error) {
    throw error;
  }
};
