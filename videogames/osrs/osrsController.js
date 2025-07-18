import express from "express";
import { broadcastMessage } from "../../bot/utilities/broadcastMessage.js";
import { uploadScreenshot } from "../../s3Test.js";
import dotenv from "dotenv";

dotenv.config();
const channelID = process.env.DISCORD_CHANNEL_ID;

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

export const osrsTest = async (req, res) => {
  const file = req.file;
  let image;
  let mimetype;
  if (!file) {
    console.log(`No image sent/attached/able to be read`);
  } else {
    image = file.buffer;
    //console.log(`File received with size: ${image.length} bytes`);
    mimetype = file.mimetype;
    //console.log(`Mimetype of file is: ${mimetype}`);
  }
  console.log(`Successfully called osrsTest with data: `);
  const data = req.body.payload_json;
  if (data) {
    try {
      //console.log(data);
      const parsedData = JSON.parse(data);
      //console.log(parsedData.discordUser.name);
      console.log(parsedData);
      if (parsedData) {
        console.log(`Items were: `);
        parsedData.extra.items.forEach((item) => {
          console.log(
            `${item.quantity} x ${item.name} (${item.priceEach} each)`
          );
        });
      }
      //const newMessage = "This is a test";
      //broadcastMessage(channelID, newMessage);
      //const image = parsedData.embeds[0].image.url;
      if (file) {
        //key (in this case image.png) can specify folder ("bounties/easy/filename.png")
        // const imageURL = await uploadScreenshot(
        //   "bounties/easy/vinnyTest.png", //difficulty/tier from cachedData
        //   image,
        //   mimetype
        // );
        // if (imageURL) {
        //   broadcastMessage(channelID, imageURL);
        // }
        console.log(`File image sent with!`);
      } else {
        console.log(`No image sent/attached/able to be read`);
      }
    } catch (error) {
      console.error(`There was an error: ${error}`);
    }
  } else {
    console.log(`No data was able to be parsed`);
  }
};
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
*/
