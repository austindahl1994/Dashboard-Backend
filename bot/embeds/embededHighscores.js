import { EmbedBuilder } from "discord.js";
import { highscores, players } from "../../videogames/osrs/cachedData.js";
import { formatBounty } from "../../videogames/osrs/bounties/bountyUtilities.js";

const highscoreEmbed = () => {
  try {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("🏆 Current Highscores")
      .setThumbnail(
        "https://oldschool.runescape.wiki/images/Ardougne_teleport_scroll_detail.png"
      );
    // console.log(players);
    const topPlayers = highscores;
    let allHS = topPlayers.map((player, index) => {
      const p = players[player.Player_Name] ?? null;
      console.log(`Player from highscores: `);
      console.log(p);
      const rp = p ? `(${p.rp})` : "";
      const total =
        parseInt(player.Score) + parseInt(players[player.Player_Name]?.rp || 0);
      return `${index + 1}. ${p.rsn || player.Player_Name} ${total} ${rp}`;
    });
    console.log(`All highscoresL:`);
    console.log(allHS);
    embed.addFields({
      name: `Bounties Completed:`,
      value: allHS.length > 0 ? allHS.join("\n") : "No highscores yet",
    });

    return embed;
  } catch (error) {
    console.log(`Could not create hs embed: ${error}`);
  }
};
/**.setDescription(
      `Holy shit, ${highscores[0].Player_Name} in first, followed up by ${highscores[1].Player_Name}, then that shitter ${highscores[2].Player_Name}`
    ); */

export const getHighscoresEmbeds = () => {
  const embeds = [];

  if (highscores.length === 0) {
    const noDataEmbed = new EmbedBuilder()
      .setTitle("No highscores available at the moment")
      .setColor(0xe74c3c); // Red color for no data
    embeds.push(noDataEmbed);
  } else {
    embeds.push(highscoreEmbed());
  }

  return embeds;
};
