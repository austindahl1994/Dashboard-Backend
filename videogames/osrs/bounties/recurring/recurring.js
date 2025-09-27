import { readSingleSheet } from ../../../services/google/sheets.js
import { recurring } from "../../cachedData.js"

const headers = ["title", "description", "url", "items"]

// Caches recurring from sheets data
const updateRecurring = async (sheetData) => {
  try {
    // const recurring = {} in cachedData
    recurring.title = []
    recurring.description = []
    recurring.url = []
    recurring.items = []
    
    sheetData.forEach((row) => {
      row.forEach((cell, index) => {
        const header = headers[index]
        // check if is items
        if (index !== 3) {
          recurring[header].push(cell.trim())
        } else {
          const splitItems = cell.split(',')
          splitItems.forEach((item) => {
            const trimmedItem = item.trim()
            recurring.items.push(trimmedItem)
          })
        }
      })
    })

    // Broadcast the recurring bounties
  } catch (error) {
    console.log("Error updating recurring bounties from sheets: ");
    console.log(error);
    throw error;
  }
};

// Compare against recurring items from dink data
export const compareRecurring = async () => {
  try {
    return false;
  } catch (error) {
    console.log(`Error comparing recurring loot: `);
    console.log(error);
    throw error;
  }
};

// If loot matches, upload image to S3 /recurring, post completion to Discord, update points for player

// Update highscores to show including bonus points


// Import sheets data for recurring bounties
export const importRecurring = async () => {
  try {
    const range = "recurring!A2:D6"
    const data = await readSingleSheet(range)
    console.log("Obtained data from sheets: ")
    console.log(data)
    updateRecurring(data)
  } catch (error) {
    console.log("Error importing recurring bounties from sheets: ");
    console.log(error);
    throw error;
  }
};
// TODO:
// Create embed to display the 3 different recurring bounties that are active
// Update cached players to include bonus points
// Add check against recurring in controller
// Consider adding the raids shit if have time
// Add /claim recurring option for claiming bounties

/**
 * {"type":"LOOT","playerName":"FistFulloTit","accountType":"GROUP_IRONMAN","dinkAccountHash":"2d695bc2b4a1f8f46828b8e25afcae5ec1a6600d93c57ccf43d592da","clanName":"Hail Cabbage","seasonalWorld":false,"world":610,"regionId":12889,"extra":{"items":[{"criteria":[],"id":8782,"quantity":266,"priceEach":2045,"name":"Mahogany plank"},{"criteria":["ALLOWLIST"],"id":21047,"quantity":1,"priceEach":50253,"name":"Torn prayer scroll"}],"source":"Chambers of Xeric Challenge Mode","category":"EVENT","killCount":71,"party":["FistFulloTit"]},"discordUser":{"id":"786762607750414337","name":"who8dbat","avatarHash":""},"content":"FistFulloTit has looted: \n\n1 x Torn prayer scroll (50.2K)\nFrom: Chambers of Xeric Challenge Mode","embeds":[]}
 *
 *  {"type":"LOOT","playerName":"bigstinki","accountType":"GROUP_IRONMAN","dinkAccountHash":"728269c041273bc1a7a11db4b972bc30814766643b0cabc0c1002bea","clanName":"Hail Cabbage","seasonalWorld":false,"world":370,"regionId":12889,"extra":{"items":[{"criteria":["ALLOWLIST"],"id":21047,"quantity":1,"priceEach":49521,"name":"Torn prayer scroll"},{"criteria":[],"id":3049,"quantity":46,"priceEach":3168,"name":"Grimy toadflax"}],"source":"Chambers of Xeric Challenge Mode","category":"EVENT","killCount":13,"party":["Iron Neven","VulvaFlickr","bigstinki","FistFulloTit"]},"discordUser":{"id":"765804682395648020","name":"maxfield73","avatarHash":"3bef0d5251221144f549fd53206e9d97"},"content":"bigstinki has looted: \n\n1 x Torn prayer scroll (49.5K)\nFrom: Chambers of Xeric Challenge Mode","embeds":[]}
 */
