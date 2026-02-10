import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../discordUtilities.js";
import { updatePlayerBuyin } from "../../vingo/players.ts";
import { allPlayers } from "../../vingo/cachedData.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("buyin")
    .setDescription("Add a buyin with optional donation")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("Select a guild member")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("rsn")
        .setDescription("Player RuneScape name")
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName("donation")
        .setDescription("Optional donation amount")
        .setRequired(true),
    ),
  async autocomplete(interaction) {
    try {
      const focused = interaction.options.getFocused();
      const suggestions = [];
      for (const [username, smallPlayer] of allPlayers) {
        const display = `${username} (${smallPlayer.nickname ?? ""})`;
        const value = smallPlayer.discord_id ?? username;
        if (
          !focused ||
          display.toLowerCase().includes(String(focused).toLowerCase()) ||
          username.toLowerCase().includes(String(focused).toLowerCase()) ||
          (smallPlayer.nickname || "")
            .toLowerCase()
            .includes(String(focused).toLowerCase())
        ) {
          suggestions.push({ name: display, value: String(value) });
        }
        if (suggestions.length >= 25) break;
      }
      await interaction.respond(suggestions.slice(0, 25));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You cannot use this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply({
        content: "Posted buyin, awaiting confirmation...",
        flags: MessageFlags.Ephemeral,
      });

      const discord_id = interaction.options.getString("user");
      const rsn = interaction.options.getString("rsn");
      const donationNum = interaction.options.getNumber("donation");
      const donation = donationNum != null ? String(donationNum) : "0";

      let member = null;
      if (interaction.guild && discord_id) {
        member =
          interaction.guild.members.cache.get(discord_id) ||
          (await interaction.guild.members.fetch(discord_id).catch(() => null));
      }

      const discord_username =
        member?.user?.username ?? discord_id ?? "unknown";
      const discord_nickname = member?.displayName ?? discord_username;

      await updatePlayerBuyin(
        discord_id,
        discord_username,
        discord_nickname,
        rsn,
        donation,
      );

      await interaction.editReply({
        content: `✅ Buy-in recorded for <@${discord_id}> with donation: ${donation}, RSN: ${rsn}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `❌ There was an error saving buy in: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
