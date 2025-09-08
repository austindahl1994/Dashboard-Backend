import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { memberMoney } from "../../videogames/osrs/data/discordMembers.js";
import { players } from "../../videogames/osrs/cachedData.js";
import { getAllMembers } from "../../services/google/osrsSheets.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("buyin")
    .setDescription("Add a buyin with optional donation")
    .addNumberOption((option) =>
      option
        .setName("donation")
        .setDescription("Optional donation amount")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("Select a guild member")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addNumberOption((option) =>
      option
        .setName("time")
        .setDescription("Intended daily playtime")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("rsn")
        .setDescription("Player RuneScape name")
        .setRequired(true)
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    let choices = [];
    if (Object.keys(players).length === 0) {
      console.log(`No cached members, fetching from guild`);
      const guildMembers = await interaction.guild.members.fetch();

      choices = guildMembers.map((m) => {
        const nickname = m.nickname ?? m.user.username;
        return {
          name: `${nickname} (${m.user.username})`,
          value: m.id,
        };
      });
    } else {
      const members = Object.keys(players).map((username) => ({
        username,
        nickname: players[username].nickname,
        id: players[username].id,
      }));

      choices = members.map((m) => ({
        name: `${m.nickname} (${m.username})`,
        value: m.id,
      }));
    }

    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    await interaction.respond(filtered.slice(0, 25));
  },

  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const id = interaction.options.getString("user"); // now user ID
      const player = Object.values(players).find((p) => p.id === id) ?? null;

      if (!player) {
        return interaction.reply({
          content: `⛔ User <@${id}> not found in cached members, please run /refresh first.`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        // console.log(`Found player for id ${id}: `);
        // console.log(player);
      }

      const { username, nickname } = player;
      const donation = interaction.options.getNumber("donation") ?? 0;
      const intendedHours = interaction.options.getNumber("time");
      const rsn = interaction.options.getString("rsn");

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      await memberMoney({
        username,
        nickname,
        id,
        donation,
        intendedHours,
        rsn,
      });

      await interaction.editReply({
        content: `✅ Buy-in recorded for <@${id}> (${nickname}) with donation: ${donation}, play time ${intendedHours}, RSN: ${rsn}`,
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
