import { EmbedBuilder } from "discord.js";

export const pet = (data, tier, scrollImage, color) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Pet Bounty")
    .setThumbnail(
      data.Wiki_Image || "https://oldschool.runescape.wiki/images/Pet_rock.png"
    )
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    });
  return embed;
};
