import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { manuallyCompleteBounty } from "../../videogames/osrs/bounties/completeBounty.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription("Claim a bounty manually")
    .addStringOption((option) =>
      option
        .setName("difficulty")
        .setDescription("The difficulty of the bounty to claim")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("The id of the bounty to claim")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("The image of the completed bounty")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!allowedUserIds.includes(interaction.user.id)) {
      return interaction.reply({
        content: "⛔ You are not allowed to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const difficulty = interaction.options
      .getString("difficulty")
      .toLowerCase();
    const id = interaction.options.getInteger("id");
    const discordUser = interaction.user.username;
    const image = interaction.options.getAttachment("image");

    await interaction.reply({
      content: `Received level: ${difficulty}\nID: ${id}\nImage: ${image.url}\nAttempting to claim bounty...`,
      flags: MessageFlags.Ephemeral,
    });
    try {
      await manuallyCompleteBounty(difficulty, id, discordUser, image.url);
      await interaction.editReply({
        content: `Successfully claimed bounty with ID ${id} on ${difficulty} difficulty.`,
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
