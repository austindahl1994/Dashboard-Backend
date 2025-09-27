import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { client } from "../mainBot.js";

const recurringChannelId = process.env.RECURRING_BOUNTY_CHANNEL_ID;
const recurringMessageId = process.env.RECURRING_BOUNTY_MESSAGE_ID || null;

export default {
  cooldown: 5,
  data: new SlashCommandBuilder().setName("recurring").setDescription("secret"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      const channel = await client.channels.fetch(recurringChannelId);
      if (!channel || !channel.isTextBased()) {
        throw new Error(`Channel not found from channel ID`);
      }
      const sent = await channel.send({ embeds: embed });
      savedMessageId = sent.id;
      console.log(`New message sent. Save this ID: ${savedMessageId}`);
    } catch (error) {
      await interaction.editReply({
        content: `There was an error updating members sheets: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
