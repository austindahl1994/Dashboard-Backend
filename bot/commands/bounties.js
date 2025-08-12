import { SlashCommandBuilder, MessageFlags } from "discord.js";

import dotenv from "dotenv";
import { updateBroadcast } from "../broadcasts.js";

dotenv.config();
const allowedChannel = process.env.EVENT_CHANNEL_ID;
const allowedUserId = process.env.TEMP_USER_ID;

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("bounties")
    .setDescription("Gets current listed bounties"),
  async execute(interaction) {
    try {
      if (interaction.channel.id !== allowedChannel) {
        return interaction.reply({
          content: "You must be in the correct channel to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
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
