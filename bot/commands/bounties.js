import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { getEmbeds } from "../embeds/embededBounties.js";
import dotenv from "dotenv";

dotenv.config();

const channelId = process.env.DISCORD_CHANNEL_ID;
const modId = process.env.MOD_ID;

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("bounties")
    .setDescription("Gets current listed bounties"),
  async execute(interaction) {
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

    const embeds = getEmbeds();
    // console.log("Total embeds generated:", embeds.length);
    // embeds.forEach((embed, i) => {
    //   console.log(`Embed #${i + 1}:`, embed.data);
    // });
    if (!embeds || embeds.length === 0) {
      return interaction.reply({
        content: `There are no current bounties, try using /refresh to update them`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
