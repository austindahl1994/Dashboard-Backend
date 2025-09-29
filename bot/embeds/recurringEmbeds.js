import { EmbedBuilder } from "discord.js";
import { recurring, players } from "../../videogames/osrs/cachedData.js";
import { getScrollImage } from "./embedUtilities.js";

const RECURRING_EMBED_COUNT = 5;
//Return array of embeds, one for each active recurring embed
//Use recurring object
export const recurringEmbed = () => {
  try {
    console.log(`Recurring data: `);
    console.log(recurring);

    const finalEmbeds = Array.from({ length: RECURRING_EMBED_COUNT }).map(
      (_, index) => {
        // console.log(`Items for index ${index}: `);
        // console.log(recurring.items[index]);

        const allItems = recurring.items[index].join("\n");

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(recurring.title[index] ?? "No Title Input")
          .setDescription(recurring.description[index] ?? "No Description")
          .setThumbnail(recurring.url[index] || getScrollImage(1))
          .addFields({
            name: "__Allowed Items__",
            value: allItems || "None input",
            inline: true,
          })
          .setAuthor({
            name: "Recurring Bounty",
            iconURL: getScrollImage(1),
          });
        return embed;
      }
    );
    // console.log(`Final recurring embeds: `);
    // console.log(finalEmbeds);
    return finalEmbeds;
  } catch (e) {
    console.error(`Error creating recurring bounties embed: ${e}`);
  }
};

//Return single embed to state there was not an existing message to update
export const emptyRecurringEmbed = () => {
  try {
    const embed = new EmbedBuilder().setTitle(
      "Need to copy this message ID and add it into .env file"
    );
    return embed;
  } catch (e) {
    console.error(`Error creating empty recurring embed: ${e}`);
  }
};

// Return single embed to display data
export const completedRecurring = (rsn, url, item) => {
  console.log(`Player: ${rsn}, URL: ${url}, Item: ${item}`);
  try {
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Recurring Bounty Completed!")
      .setDescription(
        `**${
          rsn || "?Unknown Player?"
        }** has completed a recurring bounty by getting a **${item}**!`
      )
      .setImage(url);
    return embed;
  } catch (e) {
    console.error(`Error creating completed recurring embed: ${e}`);
  }
};
