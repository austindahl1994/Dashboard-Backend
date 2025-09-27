import { readSingleSheet } from ../../../services/google/sheets.js
import { recurring, players } from "../../cachedData.js"
import { uploadScreenshot } from "../../../../services/aws/s3.js";

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
    console.log("Recurring after refresh: ")
    console.log(recurring)
    // Broadcast the recurring bounties
  } catch (error) {
    console.log("Error updating recurring bounties from sheets: ");
    console.log(error);
    throw error;
  }
};

// Compare against recurring items from dink data
export const compareRecurring = async (data, image, mimetype) => {
  try {
    if (data.type.toLowerCase() !== "loot") {
      console.log(`Not checking recurring as type is: ${data.type}`)
      return
    }
    const matchingItems = data.extra.items.filter((item) => {
      return recurring.items.includes(item)
    });

    if (matchingItems.length > 0) {
      const player = matchPlayer(data.discordUser.name, data.playerName) ?? null
      if (!player) {
        throw new Error(`Could not find player via discord: ${data.discordUser.name} or RSN: ${data.playerName}`)
      }
      const date = new Date().toISOString().replace(/[:.]/g, "-");
      let imageUrl = await uploadScreenshot(
        `recurring/${data.playerName}_${date}.png`
          .replace(/\s+/g, "_")           // replace spaces with underscores
          .replace(/[^\w.-]/g, ""),       // remove anything not allowed in filenames
        image,
        mimetype
      );
      const finalItemStr = createFinalItemString(matchingItems) 
      console.log(finalItemStr)
      await completeRecurring(player, imageURL, finalItemStr)
    } else {
      console.log(`Bounty items don't match against recurring: ${data.extra.items}`)
    }
  } catch (error) {
    console.log(`Error comparing recurring loot: `);
    console.log(error);
    throw error;
  }
};

export const manuallyCompleteRecurring = async (discord, url, rsn, items) => {
  try {
    const player = matchPlayer(discordName, rsn) || null
    if (!player) {
      throw new Error(`Could not find player via discord username: ${discord}`)
    }
    // items is single string, make into array of strings
    const passedItems = items.split(',').map(item => item.trim())
    const finalStr = createFinalItemString(passedItems)
    await completeRecurring(player, url, finalStr)
  } catch (error) {
    console.log(`Error comparing recurring loot: `);
    console.log(error);
    throw error;
  }
}


// If loot matches, post completion to Discord, update points for player
export const completeRecurring = async (playerObj, url, item) => {
  try {
    playerObj.points = Number(playerObj.points) + 2
    console.log(`After update, player points are: ${playerObj.points}`)
    const range = `teams!H${playerObj.index}`
    const dataToWrite = playerObj.points
    await writeSingleSheet(range, dataToWrite)
    await broadcastRecurring({playerObj, url, item})
    // broadcast/change highscores to also show bonus points
  } catch (error) {
    console.error('Error completing recurring task');
    console.error('Player:', playerObj);
    console.error('URL:', url);
    console.error('Item String:', itemStr);
    console.error('Error:', error);
    throw error;
  }
}

const matchPlayer = (discordName, rsn) => {
  if (!players[discordName]) {
    console.log(`No player found on list, checking via player name for discord user: ${discordName}`);
    if (!rsn) {
      throw new Error("No RSN passed in and discord user doesn't match cached values")
    }
    const searchedPlayerKey = Object.keys(players).find(
      key => players[key]?.rsn === rsn
    );

    if (searchedPlayerKey) {
      return players[searchedPlayerKey]
    } else {
      throw new Error(`Error matching player RSN: ${rsn} as it does not exist in players`)
    }
  } else {
    console.log(`Player found for recurring: ${players[discordName]}`);
    return players[discordName]
  }
}

//passed in array of strings
const createFinalItemString = (matchedItems) => {
  const trimmedItems = matchedItems.map(item => item.trim());

  if (trimmedItems.length === 1) {
    return trimmedItems[0];
  }

  if (trimmedItems.length === 2) {
    return `${trimmedItems[0]} and ${trimmedItems[1]}`;
  }

  const allButLast = trimmedItems.slice(0, -1).join(', ');
  const lastItem = trimmedItems[trimmedItems.length - 1];
  return `${allButLast}, and ${lastItem}`;
}
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
