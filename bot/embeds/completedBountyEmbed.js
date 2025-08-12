import { EmbedBuilder } from "discord.js";
import { formatBounty } from "./embedUtilities.js";

// Pass in bounty with Title, Difficulty, Discord, RSN, S3_URL, Bounty
export const completedBountyEmbed = (bounty) => {
  const player =
    typeof bounty.Discord === "string" && bounty.Discord.trim()
      ? bounty.Discord
      : bounty.RSN || "Unknown Player";

  const playerName =
    player.length > 0
      ? player[0].toUpperCase() + player.slice(1)
      : "Unknown Player";

  const gp = formatBounty(bounty.Bounty);
  const embed = new EmbedBuilder()
    .setTitle(`**${bounty.Title || bounty.Difficulty + " Task"}** Completed!`)
    // code for comparing either RSN or Discord
    .setImage(bounty.S3_URL)
    .setDescription(
      `${playerName} has completed the ${bounty.Difficulty} tier bounty, claiming a cool ${gp}!`
    );
  // finish embed with ';' symbol
  // can add footer or something as well based on RSN
  return embed;
};
