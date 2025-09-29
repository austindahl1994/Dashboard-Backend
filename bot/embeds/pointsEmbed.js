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
    // console.log(`Points data for embed: `);
    // console.log(data);
    const teamNames = ["Hard Sox", "Draynor Cabbage Mafia", "Futt Buckers"];

    const teamPointsField = teamPoints
      .map((points, i) => `${teamNames[i]}: ${points}`)
      .join("\n");

    const teamGPField = teamGP
      ? teamGP.map((gp, i) => `${teamNames[i]}: ${gp}`).join("\n")
      : "N/A";
    // console.log(`Team Points Field: ${teamPointsField}`);
    // console.log(`Team GP Field: ${teamGPField}`);

    const embed = new EmbedBuilder()
      .setTitle("Points Summary")
      .setColor("#0099ff") // optional, set embed color
      .addFields(
        { name: "Total RP", value: totalRP.toString(), inline: false },
        { name: "Claimed GP", value: claimedGP.toString(), inline: false },
        { name: "Available GP", value: availableGP.toString(), inline: false },
        {
          name: "Available Points",
          value: availablePoints.toString(),
          inline: false,
        },
        {
          name: "Claimed Points",
          value: claimedPoints ? claimedPoints.toString() : "N/A",
          inline: false,
        },
        { name: "Team Points", value: teamPointsField, inline: false },
        { name: "Team GP", value: teamGPField, inline: false }
      );

    return embed;
  } catch (e) {
    console.error(`Error creating points embed: ${e}`);
  }
};
