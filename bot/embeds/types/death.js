import { EmbedBuilder } from "discord.js";

export const death = (data, scrollImage, color, author) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Seeking Death")
    .setThumbnail(
      data.Wiki_URL ||
        "https://oldschool.runescape.wiki/images/Bones_detail.png"
    )
    .setAuthor({
      name: author,
      iconURL: scrollImage,
    });
  embed.setDescription(
    data.Description || "Die at the following location to complete the task"
  );
  return embed;
};
