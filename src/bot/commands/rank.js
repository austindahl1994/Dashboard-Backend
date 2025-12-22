import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { calcRank } from "../../cabbage/ranks/calcRank.ts";
import {
  noteEmbed,
  pathEmbed,
  rankEmbed,
} from "../embeds/cabbage/rank/rankEmbeds.js";
import dotenv from "dotenv";

dotenv.config();

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Apply for a rank within the Cabbage Clan")
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
        .setName("apply")
        .setDescription("Are you applying for a new rank?")
        .setRequired(true)
        .addChoices(
          { name: "No, just checking rank", value: "no" },
          { name: "Yes, pvm", value: "pvm" },
          { name: "Yes, skilling", value: "skilling" },
          { name: "Yes, hybrid", value: "hybrid" }
        )
    ),
  async execute(interaction) {
    try {
      const rsn = interaction.options.getString("rsn");
      const apply = interaction.options.getString("apply");
      const firecape =
        interaction.options.getString("firecape") === "yes" ? true : false;
      const quiverOrInfernal =
        interaction.options.getString("quiver-or-infernal") === "yes"
          ? true
          : false;
      const combatAchievements =
        interaction.options.getString("combat-achievements") ?? "none";
      const diaries = interaction.options.getString("diaries") ?? "none";
      const events = Number(interaction.options.getString("events")) || 0;

      // Get user data
      const targetUser = interaction.user;
      const member = await interaction.guild.members.fetch(targetUser.id);

      // Get discord nickname, or if not set, the username
      const username = member.nickname ?? targetUser.username;
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
        content: "Calculating rank...",
        flags: MessageFlags.Ephemeral,
      });

      const ranks = await calcRank(inputData);
      const embeds = rankEmbed(ranks);
      // after you edit the interaction reply
      if (apply === "no") {
        const noteEmbedInstance = noteEmbed();
        const finalEmbeds = [noteEmbedInstance, ...embeds];
        await interaction.editReply({
          embeds: finalEmbeds,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      // PLAYER IS APPLYING FOR RANK AS WELL ----------------------------
      // path is apply, since choices are pvm, skilling, hybrid by value, no need to split
      const pathDefinitionEmbed = pathEmbed(username, rsn, apply);
      const finalEmbeds = [pathDefinitionEmbed, ...embeds];
      await interaction.editReply({
        content: `Successfully applied for rank down the ${apply.toUpperCase()} path!`,
        flags: MessageFlags.Ephemeral,
      });
      const channelId = process.env.RANK_CHANNEL_ID;
      const targetChannel = await interaction.client.channels.fetch(channelId);
      if (!targetChannel || typeof targetChannel.send !== "function") {
        console.error("Channel not found or not sendable");
        return;
      }
      await targetChannel.send({
        embeds: finalEmbeds,
      });
    } catch (error) {
      await interaction.editReply({
        content: `There was an error calcing rank: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
