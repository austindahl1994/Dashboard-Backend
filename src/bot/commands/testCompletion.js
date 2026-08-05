import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { getCabbageUserByDiscordId } from "../../cabbage/cabbage-main/mvc/cabbage.ts";
import {
  cabbageUsersByDiscordID,
  upsertCabbageUserCache,
} from "../../cabbage/cabbage-main/globalCabbage.ts";
import { towerCompletion } from "../embeds/cabbage/completion.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("completion")
    .setDescription("Test completion command")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("What item should be put")
        .setRequired(true),
    ),
  async execute(interaction) {
    try {
      const item = interaction.options.getString("item");
      const user = interaction.user;
      const discord_id = user.id;
      let cabbageUser = cabbageUsersByDiscordID.get(discord_id) ?? null;

      if (!cabbageUser) {
        cabbageUser = await getCabbageUserByDiscordId(discord_id);
        if (cabbageUser) {
          upsertCabbageUserCache(cabbageUser);
        }
      }

      const rsn = cabbageUser?.rsn;
      const embed = towerCompletion(
        rsn,
        69,
        "https://cabbage-clan.s3.us-east-2.amazonaws.com/TowerOfTrials/Completions/IronDubzie/0/Sulphur_blades_1785903789257.png",
        true,
        item,
      );
      console.log(cabbageUser);
      await interaction.reply({
        embeds: embed,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`Error testing completion: ${error}`);
      await interaction.reply({
        content: `There was an error testing completion.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
