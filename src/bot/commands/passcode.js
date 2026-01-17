import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { createPlayerToken } from "../../auth/jwtUtils.js";
import { playersMap } from "../../vingo/cachedData.js";

// Checks if player is part of cached players
// Make player add a username for the passcode? This way it double checks we have the correct username for player from buyin
// If player has paid and is cached, will create and return JWT for that player to use

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("passcode")
    .setDescription("Gets player passcode for website")
    .addStringOption((option) =>
      option.setName("rsn").setDescription("RSN").setRequired(true),
    ),
  async execute(interaction) {
    try {
      const discord_id = interaction.user.id;
      if (!playersMap.has(discord_id)) {
        throw new Error(
          `Could not create passcode, discord ID ${discord_id} is not on the list of players`,
        );
      }
      const player = playersMap.get(discord_id);
      if (!player) {
        throw new Error(`No player with discord ID ${discord_id}`);
      }
      if (player.rsn !== interaction.options.getString("rsn")) {
        throw new Error(
          `Your RSN does not match what is on sheets. Make sure it's the *EXACTLY SAME* or check with a mod`,
        );
      }
      if (!player.team && player.team !== 0) {
        throw new Error(
          `You have not been assigned a team yet, check with a mod if you should be`,
        );
      }
      const passcode = createPlayerToken(player.rsn, player.team, discord_id);
      // const displayJwt = passcode
      //   .split(".")
      //   .map((part) => part + ".")
      //   .join("\n");

      // const displayJwtFinal = displayJwt.slice(0, -1);

      await interaction.reply({
        content: `Passcode:\n\`\`\`\n${passcode}\n\`\`\``,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.log(`There was an error getting passcode: ${error}`);
      await interaction.reply({
        content:
          "Error creating passcode, please make sure your RSN entered is **EXACTLY** the same as your in-game name. If it is, please reach out to an Event Moderator. Server error: " +
          error,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
