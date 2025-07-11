import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { getEmbeds } from "../embeds/embededBounties.js";
import dotenv from "dotenv";

dotenv.config();

const channelId = process.env.DISCORD_CHANNEL_ID;

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("bounties")
    .setDescription("Gets current listed bounties."),
  async execute(interaction) {
    if (interaction.channelId !== channelId) {
      return interaction.reply({
        content: "You must be in the proper channel to make use this command",
        flags: MessageFlags.Ephemeral,
      });
    }

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

    // await interaction.reply(
    //   "This is where bounties will appear along with wiki image, total GP value, etc"
    // );

    await interaction.reply({ embeds: embeds });
  },
};
