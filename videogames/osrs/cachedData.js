//Holds all current bounty objects ()UPDATE TO EMPTY ON SERVER
export const cachedBounties = [
  {
    Item: "t1 item",
    Source: "General Graardor",
    Description: "",
    Type: "",
    Bounty: "0.5",
    Wiki_URL:
      "https://oldschool.runescape.wiki/images/General_Graardor.png?4dd90",
    Status: "Active",
    Other: "",
    Player_Name: "",
    S3_URL: "",
    Number_Slain: 0,
    Sheet_Index: 2,
  },
  {
    Item: "t2 item",
    Source: "General Graardor",
    Description: "",
    Type: "",
    Bounty: "0.5",
    Wiki_URL:
      "https://oldschool.runescape.wiki/images/General_Graardor.png?4dd90",
    Status: "Active",
    Other: "",
    Player_Name: "",
    S3_URL: "",
    Number_Slain: 0,
    Sheet_Index: 2,
  },
  {
    Item: "t3 item",
    Source: "Something else",
    Description: "",
    Type: "CLUE",
    Bounty: "1",
    Wiki_URL:
      "https://oldschool.runescape.wiki/images/General_Graardor.png?4dd90",
    Status: "Active",
    Other: "",
    Player_Name: "",
    S3_URL: "",
    Number_Slain: 0,
    Sheet_Index: 2,
  },
];

//Faster way to check if a part of the bounties
//Maybe objects {type: "LOOT", targets: []}
export const simpleBounties = [];

//holds all sheet objects
export const cachedSheets = [];

//holds current highscores created by parsing sheets data
export const highscores = [];
