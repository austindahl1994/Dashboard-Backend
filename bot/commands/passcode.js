import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { playersMap, Player } from "../../vingo/cachedData.ts"
import { createPlayerToken } from "../../auth/jwtUtils.js"
// Checks if player is part of cached players 
// Make player add a username for the passcode? This way it double checks we have the correct username for player from buyin
// If player has paid and is cached, will create and return JWT for that player to use

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("passcode")
    .setDescription("Gets player passcode for website"),
  .addStringOption((option) =>
      option
        .setName("rsn")
        .setDescription("RSN")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const discord_id = interaction.user.id;
      if (!playersMap.has(discord_id)) {
        throw new Error(`Could not create passcode, your discord ID is not on the list of players`)
      } 
      const player : Player = playersMap.get(discord_id)
      if (player.rsn !== interaction.options.getString("rsn")) {
        throw new Error(`Your RSN does not match what is on sheets. Make sure it is *EXACTLY THE SAME* or check with a mod`)
      }
      if (!player.team && player.team !== 0) {
        throw new Error(`You have not been assigned a team yet, please check with an event moderator`)
      }
      const passcode: string = createPlayerToken(player.team, player.discord_id)
      await interaction.reply({
        content: passcode
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.log(`There was an error getting passcode: ${error}`)
      await interaction.reply({
        content: error,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
