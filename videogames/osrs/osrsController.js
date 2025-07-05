import express from "express";
import { getCachedData } from "./checkCached.js";

export const osrsTest = async (req, res) => {
  console.log(`Successfully called osrsTest with data: `);
  const data = req.body.payload_json;
  if (data) {
    try {
      const parsedData = JSON.parse(data);
    } catch (error) {
      console.error(`There was an error: ${error}`);
    }
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
ALL DATA INCLUDING OBJECTS
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
