export interface DiscordUser {
  id: string;
  name: string;
}

interface Items {
  name: string;
}

interface Extra {
  items?: Items[];
  source?: string;
  isPvP?: string;
  killerName?: string;
}

export interface Dink {
  type: string;
  playerName: string;
  extra?: Extra;
  discordUser?: DiscordUser;
}
/*
---------------
ALWAYS SENT
---------------
{
  "content": "Text message as set by the user",
  "extra": {},
  "type": "NOTIFICATION_TYPE",
  "playerName": "your rsn",
  "accountType": "NORMAL | IRONMAN | HARDCORE_IRONMAN",
  "seasonalWorld": "true | false",
  "dinkAccountHash": "abcdefghijklmnopqrstuvwxyz1234abcdefghijklmnopqrstuvwxyz",
  "embeds": []
}
---------------
SOMETIMES SENT
---------------
{
  "clanName": "Dink QA",
  "groupIronClanName": "Dink QA",
  "discordUser": {
    "id": "012345678910111213",
    "name": "Gamer",
    "avatarHash": "abc123def345abc123def345abc123de"
  },
  "world": 518,
  "regionId": 12850
}
---------------
SENT FOR LOOT
---------------
{
  "content": "%USERNAME% has looted: \n\n%LOOT%\nFrom: %SOURCE%",
  "extra": {
    "items": [
      {
        "id": 1234,
        "quantity": 1,
        "priceEach": 42069,
        "name": "Some item",
        "criteria": ["VALUE"],
        "rarity": null
      }
    ],
    "source": "Tombs of Amascut",
    "party": ["%USERNAME%", "another RSN", "yet another RSN"],
    "category": "EVENT",
    "killCount": 60,
    "rarestProbability": 0.001,
    "npcId": null
  },
  "type": "LOOT"
}
*/
