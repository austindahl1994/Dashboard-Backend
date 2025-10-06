import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { manuallyCompleteRecurring } from "../../videogames/osrs/bounties/recurring/recurring.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("reclaim")
    .setDescription("Claim a recurring bounty manually")
    .addStringOption((option) =>
      option.setName("rsn").setDescription("Player Name").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("items")
        .setDescription("Item(s) you got to claim recurring bounty")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("The image of your drop")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      await interaction.reply({
        content: `Bounty event is over!`,
        flags: MessageFlags.Ephemeral,
      });
      await interaction.deferReply({
        content: "Attempting to claim recurring bounty",
        flags: MessageFlags.Ephemeral,
      });
      const rsn = interaction.options.getString("rsn").toLowerCase();
      const items = interaction.options.getString("items").toLowerCase();
      const discord = interaction.user.username;
      const image = interaction.options.getAttachment("image");
      await manuallyCompleteRecurring(discord, image.url, rsn, items);
      await interaction.editReply({
        content: `Successfully completed a recurring bounty.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Could not claim bounty, error of: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
