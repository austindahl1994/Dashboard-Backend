import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { manuallyCompleteBounty } from "../../videogames/osrs/bounties/completeBounty.js";
const allowedUserId = process.env.TEMP_USER_ID;
const allowedChannel = process.env.EVENT_CHANNEL_ID;
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
    //REMOVE FOR EVENT
    if (interaction.user.id !== allowedUserId) {
      return interaction.reply({
        content: "Yo fuckoff, you don't need to be here right now.",
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.channel.id !== allowedChannel) {
      return interaction.reply({
        content: "You must be in the correct channel to use this command.",
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
    await manuallyCompleteBounty(difficulty, id, discordUser, image.url);
    await interaction.editReply({
      content: `Successfully claimed bounty with ID ${id} on ${difficulty} difficulty.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
