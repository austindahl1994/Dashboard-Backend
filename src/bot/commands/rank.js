import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { calcRank } from "../../cabbage/ranks/calcRank.ts";
import { rankEmbed } from "../embeds/cabbage/rank/rankEmbeds.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Check your rank within the Cabbage clan")
    .addStringOption((option) =>
      option.setName("rsn").setDescription("RSN").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("firecape")
        .setDescription("Obtained fire cape?")
        .setRequired(true)
        .addChoices({ name: "Yes", value: "yes" }, { name: "No", value: "no" })
    )
    .addStringOption((option) =>
      option
        .setName("quiver-or-infernal")
        .setDescription("Obtained Quiver OR Infernal Cape?")
        .setRequired(true)
        .addChoices({ name: "Yes", value: "yes" }, { name: "No", value: "no" })
    )
    .addStringOption((option) =>
      option
        .setName("combat-achievements")
        .setDescription("Combat Achievements tier completed?")
        .setRequired(true)
        .addChoices(
          { name: "None", value: "none" },
          { name: "Easy", value: "easy" },
          { name: "Medium", value: "medium" },
          { name: "Hard", value: "hard" },
          { name: "Elite", value: "elite" },
          { name: "Master", value: "master" },
          { name: "Grandmaster", value: "grandmaster" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("diaries")
        .setDescription("Diaries tier completed?")
        .setRequired(true)
        .addChoices(
          { name: "None", value: "none" },
          { name: "Easy", value: "easy" },
          { name: "Medium", value: "medium" },
          { name: "Hard", value: "hard" },
          { name: "Elite", value: "elite" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("events")
        .setDescription(
          "How many events (BOTW/SOTW/ROTM) have you participated in?"
        )
        .setRequired(true)
        .addChoices(
          { name: "0 Events", value: "0" },
          { name: "2 Events", value: "1" },
          { name: "4 Events", value: "2" },
          { name: "6 Events", value: "3" },
          { name: "12 Events", value: "4" },
          { name: "15 Events", value: "5" },
          { name: "15 events + 1 Bingo", value: "6" },
          { name: "15 events + 1 Bingo + Invited a friend", value: "8" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("What category are you applying for?")
        .setRequired(true)
        .addChoices(
          { name: "PvM", value: "pvm" },
          { name: "Skilling", value: "skilling" },
          { name: "Hybrid", value: "hybrid" }
        )
    ),
  async execute(interaction) {
    try {
      // Get interaction options
      const rsn = interaction.options.getString("rsn");

      const firecape =
        interaction.options.getString("firecape") === "yes" ? true : false;
      const quiverOrInfernal =
        interaction.options.getString("quiver-or-infernal") === "yes"
          ? true
          : false;
      const combatAchievements =
        interaction.options.getString("combat-achievements") ?? "none";
      const diaries = interaction.options.getString("diaries") ?? "none";
      const choice = interaction.options.getString("choice");
      const events = Number(interaction.options.getString("events")) || 0;

      // Get user data
      const targetUser = interaction.user;
      const member = await interaction.guild.members.fetch(targetUser.id);
      const joinTime = member.joinedAt;

      const inputData = {
        rsn,
        firecape,
        quiverOrInfernal,
        combatAchievements,
        diaries,
        events,
        joinTime,
      };

      await interaction.deferReply({
        content: "Attempting to calculate rank",
        flags: MessageFlags.Ephemeral,
      });

      const ranks = await calcRank(inputData);
      const embeds = rankEmbed(ranks);
      await interaction.editReply({
        embeds,
        // content: `Called rank checker, this has not been implemented yet.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `There was an error calcing rank: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
