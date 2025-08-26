import { SlashCommandBuilder, MessageFlags } from "discord.js";

import dotenv from "dotenv";
import { updateBroadcast } from "../broadcasts.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

dotenv.config();

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("bounties")
    .setDescription("Gets current listed bounties"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await updateBroadcast("bounties");
      await interaction.reply({
        content: "Called bounty board broadcast",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error calling bounties: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

// if (interaction.user.id !== allowedUserId) {
//   return interaction.reply({
//     content: "Yo fuckoff, you don't need to be here right now.",
//     flags: MessageFlags.Ephemeral,
//   });
// }

// const embeds = getAllBountyEmbeds();

// if (!embeds || embeds.length === 0) {
//   return interaction.reply({
//     content: `There are no current bounties, try using /refresh to update them`,
//     flags: MessageFlags.Ephemeral,
//   });
// }

// await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
// if (!interaction.member.roles.cache.has(modId)) {
//   return interaction.reply({
//     content: "Only moderators can use this command.",
//     flags: MessageFlags.Ephemeral,
//   });
// }
// if (interaction.channelId !== channelId) {
//   return interaction.reply({
//     content: "You must be in the proper channel to make use this command",
//     flags: MessageFlags.Ephemeral,
//   });
// }
// console.log("Total embeds generated:", embeds.length);
// embeds.forEach((embed, i) => {
//   console.log(`Embed #${i + 1}:`, embed.data);
// });
