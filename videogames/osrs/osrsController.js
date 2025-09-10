import { checkBounties } from "./bounties/checkBounties.js";
import { completeBounty } from "./bounties/completeBounty.js";
import { uploadScreenshot } from "../../services/aws/s3.js";
import { updateBroadcast } from "../../bot/broadcasts.js";

import dotenv from "dotenv";
import { highscores } from "./cachedData.js";
dotenv.config();

export const osrsController = async (req, res) => {
  // console.log(`Received a request at osrsController`);
  const file = req.file;
  let image;
  let mimetype;
  try {
    if (!file) {
      console.log(`No file sent with`);
      // throw new Error(`No file sent with`);
    } else {
      image = file.buffer;
      mimetype = file.mimetype;
    }
    const data = req.body.payload_json;
    if (data) {
      const parsedData = JSON.parse(data);
      if (parsedData) {
        console.log(`Received data from ${parsedData.playerName}`);
        console.log(JSON.stringify(parsedData));
        const completedBounties = checkBounties(parsedData);
        if (completedBounties && completedBounties.length > 0) {
          for (const bounty of completedBounties) {
            bounty.Completed = true;
            let imageUrl = await uploadScreenshot(
              `bounties/${bounty.Difficulty}/${
                bounty.Id
              }:${bounty.Title.replace(/\s+/g, "_").replace(
                /[^\w.-]/g,
                ""
              )}-${parsedData.playerName
                .replace(/\s+/g, "_")
                .replace(/[^\w.-]/g, "")}.png`,
              image,
              mimetype
            );
            await completeBounty(parsedData, bounty, imageUrl);
          }
          await updateBroadcast("highscores");
          await updateBroadcast("bounties");
          if (req.file) {
            delete req.file;
            image = null;
          }
        } else {
          throw new Error("Bounties don't match.");
        }
      }
    } else {
      throw new Error(`No data was able to be parsed`);
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(`Deleting file because: ${error}`);
    if (req.file) {
      delete req.file;
      image = null;
    }
    res.sendStatus(200);
  }
};
// console.log(parsedData);
// console.log(`Successfully called osrsTest with data: `);
// console.log(parsedData.discordUser.name);
// console.log(`File received with size: ${image.length} bytes`);
// console.log(`Mimetype of file is: ${mimetype}`);
// if (parsedData.type === "LOOT") {
//   console.log(`Items were: `);
//   parsedData?.extra?.items.forEach((item) => {
//     console.log(
//       `${item.quantity} x ${item.name} (${item.priceEach} each)`
//     );
//   });
// }
// const newMessage = "This is a test";
// broadcastMessage(channelID, newMessage);
// const image = parsedData.embeds[0].image.url;
// key (in this case image.png) can specify folder ("bounties/easy/filename.png")
// const imageURL = await uploadScreenshot(
//   "bounties/easy/vinnyTest.png", //difficulty/tier from cachedData
//   image,
//   mimetype
// );
// if (imageURL) {
//   broadcastMessage(channelID, imageURL);
// }

//TODO: Left off on google sheets, works if cached sheets/bounties are empty, NEED TO CALL ON SERVER START WHEN IN PROD, rather than checks, have it be a create since shouldnt exist
//NEXT: Get discord embeds to work properly with temp data saved in cached
// get highscores working
// get ways to complete tasks working
// check from dink
// On bounty completion, immediately mark as completed then rest of info can just be a write
// get s3 image save working depending on tier, then add to the cachedBounty (or just a batchWrite)
// Count for cachedSource +1 on completion
// Broadcast for bounty completion
// When an entire tier of the board is completed, some error check for it or replace it with a higher tier bounty if there are still some available
/*

%USERNAME% has looted: 

%LOOT%
From: %SOURCE%
--
"description":"IronDubzie has looted: \n\n1 x [Big bones](https://oldschool.runescape.wiki/w/Special:Search?search\u003dBig%20bones) (243)\nFrom: [Lizardman shaman](https://oldschool.runescape.wiki/w/Special:Search?search\u003dLizardman%20shaman)",

{
  type: 'LOOT',
  playerName: 'IronDubzie',
  accountType: 'IRONMAN',
  dinkAccountHash: 'd40940f90a0927a147367320958d0dc6b46730962c5c1db5d439f53a',
  clanName: 'Hail Cabbage',
  seasonalWorld: false,
  world: 489,
  regionId: 5690,
  extra: {
    items: [ [Object], [Object] ],
    source: 'Lizardman shaman',
    category: 'NPC',
    killCount: 2303,
    rarestProbability: 0.05,
    npcId: 6767
  },
  discordUser: {
    id: '196090993433378816',
    name: 'itzdubz',
    avatarHash: 'f2aa33e687d6a8167620ab30ef2581a1'
  },
  embeds: [
    {
      title: 'Loot Drop',
      description: '3169',
      author: [Object],
      color: 15990936,
      thumbnail: [Object],
      fields: [Array]
    }
  ]
}
-------------------ALL DATA INCLUDING OBJECTS-------------------------
{
   "type":"LOOT",
   "playerName":"IronDubzie",
   "accountType":"IRONMAN",
   "dinkAccountHash":"d40940f90a0927a147367320958d0dc6b46730962c5c1db5d439f53a",
   "clanName":"Hail Cabbage",
   "seasonalWorld":false,
   "world":489,
   "regionId":5690,
   "extra":{
      "items":[
         {
            "criteria":[
               "VALUE"
            ],
            "id":532,
            "quantity":1,
            "priceEach":243,
            "name":"Big bones"
         }
      ],
      "source":"Lizardman shaman",
      "category":"NPC",
      "killCount":2213,
      "npcId":6767
   },
   "discordUser":{
      "id":"196090993433378816",
      "name":"itzdubz",
      "avatarHash":"f2aa33e687d6a8167620ab30ef2581a1"
   },
   "embeds":[
      {
         "title":"Loot Drop",
         "description":"IronDubzie has looted: \n\n1 x [Big bones](https://oldschool.runescape.wiki/w/Special:Search?search\u003dBig%20bones) (243)\nFrom: [Lizardman shaman](https://oldschool.runescape.wiki/w/Special:Search?search\u003dLizardman%20shaman)",
         "author":{
            "name":"IronDubzie",
            "icon_url":"https://oldschool.runescape.wiki/images/Ironman_chat_badge.png",
            "url":"https://secure.runescape.com/m\u003dhiscore_oldschool/hiscorepersonal?user1\u003dIronDubzie"
         },
         "color":15990936,
         "thumbnail":{
            "url":"https://static.runelite.net/cache/item/icon/532.png"
         },
         "fields":[
            {
               "name":"Kill Count",
               "value":"```\n2,213\n```",
               "inline":true
            },
            {
               "name":"Total Value",
               "value":"```ldif\n243 gp\n```",
               "inline":true
            }
         ],
         "footer":{
            "text":"What a beast"
         },
         "timestamp":"2025-07-04T23:17:06.328172200Z"
      }
   ]
}

DEATH:
{
  type: 'DEATH',
  playerName: 'ItzDubz',
  accountType: 'NORMAL',
  dinkAccountHash: '1554434bf24603e8cd680dc34f23301c6da2ad600e15a1a6875afb7e',
  clanName: 'Hail Cabbage',
  seasonalWorld: false,
  world: 486,
  regionId: 12342,
  extra: {
    valueLost: 0,
    isPvp: false,
    keptItems: [ [Object], [Object], [Object] ],
    lostItems: [],
    location: { regionId: 12342, plane: 0, instanced: false }
  },
  discordUser: {
    id: '196090993433378816',
    name: 'itzdubz',
    avatarHash: 'f2aa33e687d6a8167620ab30ef2581a1'
  },
  embeds: [
    {
      title: 'Player Death',
      description: 'ItzDubz has died...',
      author: [Object],
      color: 15990936,
      image: [Object],
      thumbnail: [Object],
      fields: []
    }
  ]
}

*/
