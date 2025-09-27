import { EmbedBuilder } from "discord.js";
import { recurring } from "../../videogames/osrs/cachedBounty.js"

const RECURRING_EMBED_COUNT = 5
//Return array of embeds, one for each active recurring embed
//Use recurring object
export const recurringEmbed = () => {
  try {
    const finalEmbeds = Array.from({ length: RECURRING_EMBED_COUNT }).map((_, index) => {
      const allItems = recurring.items.join(',')
      
      const embed = new EmbedBuilder()
        .setTitle(recurring.title[index])
        .setDescription(recurring.description[index])
        .setThumbnail(recurring.url[index])
        .addFields({
          name: "Allowed Items", value: allItems || "None input"
        });
      return embed
    })
    return finalEmbeds
  } catch (e) {
    console.error(`Error creating recurring bounties embed: ${e}`);
  }
}

//Return single embed to state there was not an existing message to update
export const emptyRecurringEmbed = () => {
  try {
    const embed = new EmbedBuilder()
      .setTitle("Need to copy this message ID and add it into .env file");
    return embed
  } catch (e) {
    console.error(`Error creating empty recurring embed: ${e}`);
  }
}


// Return single embed to display data
export const completedRecurring = (data) => {
  const {rsn, item, team, url} = data
  try {
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Recurring Bounty Completed!")
      .setDescription(`**${rsn}** has completed a recurring bounty by getting a **${item}**!`)
      .setImage(url)
    return embed
  } catch (e) {
    console.error(`Error creating completed recurring embed: ${e}`);
  }
}
