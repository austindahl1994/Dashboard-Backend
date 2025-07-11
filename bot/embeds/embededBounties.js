import { EmbedBuilder } from "discord.js";
import { cachedBounties } from "../../videogames/osrs/cachedData.js";
const embed1 = new EmbedBuilder()
  .setColor(0x229954)
  .setTitle("Image 1")
  .setThumbnail("https://oldschool.runescape.wiki/images/General_Graardor.png");

const embed2 = new EmbedBuilder()
  .setColor(0xf4d03f)
  .setTitle("Image 2")
  .setDescription("Some description here")
  .setThumbnail(
    "https://oldschool.runescape.wiki/images/General_Graardor.png?4dd90"
  )
  .addFields({
    name: "Inline field title",
    value: "Some value here",
    inline: true,
  });

const embed3 = new EmbedBuilder()
  .setColor(0xa93226)
  .setTitle("Image 3")
  .setThumbnail(
    "https://cabbage-bounty.s3.us-east-2.amazonaws.com/test-discord.png"
  );

// const embeds = cachedBounties.map((data) => {
//   const embed = new EmbedBuilder()
//     .setColor(data.color)
//     .setTitle(data.title)
//     .setThumbnail(data.thumbnail);

//   if (data.description) {
//     embed.setDescription(data.description);
//   }

//   if (data.fields) {
//     embed.addFields(data.fields);
//   }

//   return embed;
// });

// export default embeds;

export default [embed1, embed2, embed3];
