import { EmbedBuilder } from "discord.js";
import { highscores } from "../../videogames/osrs/cachedData.js";
import { formatBounty } from "../../videogames/osrs/bounties/bountyUtilities.js";

const highscoreEmbed = () => {
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle("🏆 Current Highscores")
    .setThumbnail(
      "https://oldschool.runescape.wiki/images/Ardougne_teleport_scroll_detail.png"
    );

  const topPlayers = highscores.slice(0, 10);
  topPlayers.forEach((player, index) => {
    const medal =
      index === 0
        ? "🥇"
        : index === 1
        ? "🥈"
        : index === 2
        ? "🥉"
        : `#${index + 1} - `;
    embed.addFields({
      name: `__${medal} ${player.Player_Name}__`,
      value: `**Points:** ${player.Score} ${
        player.Player_Name === "Happy" ? "...Holy fuck Happy, you go man" : ""
      }\n**GP made:** ${formatBounty(player.TotalBounty)}`,
      inline: false, // set to true for side-by-side
    });
  });

  return embed;
};
/**.setDescription(
      `Holy shit, ${highscores[0].Player_Name} in first, followed up by ${highscores[1].Player_Name}, then that shitter ${highscores[2].Player_Name}`
    ); */

export const getHighscoresEmbeds = () => {
  const embeds = [];

  if (highscores.length === 0) {
    const noDataEmbed = new EmbedBuilder()
      .setDescription("No highscores available at the moment.")
      .setColor(0xe74c3c); // Red color for no data
    embeds.push(noDataEmbed);
    return embeds;
  } else {
    embeds.push(highscoreEmbed());
  }

  return embeds;
};
