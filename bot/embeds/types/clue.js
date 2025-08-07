import { EmbedBuilder } from "discord.js";

const getScrollTier = (tier) => {
  switch (tier) {
    case "Medium":
      return "https://oldschool.runescape.wiki/images/Scroll_box_%28medium%29_detail.png";
    case "Hard":
      return "https://oldschool.runescape.wiki/images/Scroll_box_%28hard%29_detail.png";
    case "Elite":
      return "https://oldschool.runescape.wiki/images/Scroll_box_%28elite%29_detail.png";
    case "Master":
      return "https://oldschool.runescape.wiki/images/Scroll_box_%28master%29_detail.png";
    default:
      return "https://oldschool.runescape.wiki/images/Scroll_box_%28easy%29_detail.png";
  }
};

export const clue = (data, tier, scrollImage, color) => {
  // console.log(`Generating clue embed for tier: ${tier}`);
  const scrollBoxImage = getScrollTier(tier);
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Clue Scroll Bounty")
    .setThumbnail(scrollBoxImage)
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    })
    .setFooter({
      text: `Task ID: ${data.Id}`,
    });
  // ...add clue-specific fields here...
  return embed;
};
