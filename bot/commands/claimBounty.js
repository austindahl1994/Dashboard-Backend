import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { manuallyCompleteBounty } from "../../videogames/osrs/bounties/completeBounty.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { difficultyToTier } from "../../videogames/osrs/bounties/bountyUtilities.js";
import { cachedBounties } from "../../videogames/osrs/cachedData.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription("Claim a bounty manually")
    .addStringOption((option) =>
      option
        .setName("difficulty")
        .setDescription("Select the difficulty of the bounty to claim")
        .setRequired(true)
        .addChoices(
          { name: "Easy", value: "easy" },
          { name: "Medium", value: "medium" },
          { name: "Hard", value: "hard" },
          { name: "Elite", value: "elite" },
          { name: "Master", value: "master" }
        )
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("The image of the completed bounty")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command (At this time).",
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply({ 
          content: "Attempting to claim bounty",
          flags: MessageFlags.Ephemeral 
        });
      const difficulty = interaction.options
        .getString("difficulty")
        .toLowerCase();
      const id = cachedBounties[difficultyToTier(difficulty)]?.Id;
      const discordUser = interaction.user.username;
      const image = interaction.options.getAttachment("image");
      await manuallyCompleteBounty(difficulty, id, discordUser, image.url);
      await interaction.editReply({
        content: `Successfully claimed ${difficulty} bounty.`,
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
