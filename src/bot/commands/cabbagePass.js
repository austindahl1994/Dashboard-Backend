import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { updateCabbageUserPassword } from "../../cabbage/cabbage-main/mvc/cabbage.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("updatehubpassword")
    .setDescription("Set or update your Cabbage Hub password")
    .addStringOption((option) =>
      option
        .setName("password")
        .setDescription("Your Cabbage Hub password")
        .setRequired(true),
    ),
  async execute(interaction) {
    try {
      const password = interaction.options.getString("password");
      const user = interaction.user;
      const discord_id = user.id;

      const hasValidLength = password.length >= 5 && password.length <= 15;
      const hasUppercase = /[A-Z]/.test(password);
      const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (
        !hasValidLength ||
        !hasUppercase ||
        !hasSpecialCharacter ||
        !hasNumber
      ) {
        await interaction.reply({
          content:
            "Password must be 5-15 characters long and include at least one uppercase letter, one number, and one special character.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await updateCabbageUserPassword(discord_id, password);
      await interaction.reply({
        content: `Your Cabbage Hub password has been updated!\nYour discord ID to log in is:\n\`\`\`\n${discord_id}\n\`\`\``,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`Error updating Cabbage Hub password: ${error}`);
      await interaction.reply({
        content: `There was an error updating your Cabbage Hub password. Please try again later.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
