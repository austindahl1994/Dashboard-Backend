import { EmbedBuilder } from "discord.js";

export const pointsEmbed = (data) => {
  try {
    const {
      totalRP,
      claimedGP,
      availableGP,
      availablePoints,
      teamPoints,
      teamGP,
      claimedPoints,
    } = data;

    // If you want, you can create some labels for teamPoints and teamGP arrays
    const teamNames = ["Hard Sox", "Draynor Cabbage Mafia", "Futt Buckers"];

    // Format the team points and team GP fields nicely
    const teamPointsField = teamPoints
      .map((points, i) => `${teamNames[i]}: ${points}`)
      .join("\n");

    const teamGPField = teamGP
      ? teamGP.map((gp, i) => `${teamNames[i]}: ${gp}`).join("\n")
      : "N/A";

    // Build the embed
    const embed = new EmbedBuilder()
      .setTitle("Points Summary")
      .setColor("#0099ff") // optional, set embed color
      .addFields(
        { name: "Total RP", value: totalRP.toString(), inline: true },
        { name: "Claimed GP", value: claimedGP.toString(), inline: true },
        { name: "Available GP", value: availableGP.toString(), inline: true },
        { name: "Available Points", value: availablePoints.toString(), inline: true },
        { name: "\u200B", value: "\u200B" }, // blank line to separate sections
        { name: "Team Points", value: teamPointsField, inline: true },
        { name: "Team GP", value: teamGPField, inline: true },
        { name: "Claimed Points", value: claimedPoints ? claimedPoints.toString() : "N/A", inline: true }
      );

    return embed;
  } catch (e) {
    console.error(`Error creating points embed: ${e}`);
  }
};
