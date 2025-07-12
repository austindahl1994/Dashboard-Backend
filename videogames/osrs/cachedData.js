//Holds all current bounty objects ()UPDATE TO EMPTY ON SERVER
export const cachedBounties = [
  {
    Title: "Mind Goblin",
    Item: "Bones",
    Source: "Goblin",
    Description: "Mind goblin on these... bones",
    Type: "LOOT",
    Bounty: "5K",
    Wiki_URL: "https://oldschool.runescape.wiki/w/Goblin",
    Status: "Active",
    Other: "",
    Player_Name: "",
    S3_URL: "",
    Quantity: 0,
    Sheet_Index: 1,
    Wiki_Image: "https://oldschool.runescape.wiki/images/Goblin.png",
  },
  {
    Title: "",
    Item: "t2 item",
    Source: "General Graardor",
    Description: "",
    Type: "LOOT",
    Bounty: "500K",
    Wiki_URL: "https://oldschool.runescape.wiki/w/General_Graardor",
    Status: "Active",
    Other: "",
    Player_Name: "",
    S3_URL: "",
    Quantity: 0,
    Sheet_Index: 1,
    Wiki_Image: "https://oldschool.runescape.wiki/images/General_Graardor.png",
  },
  {
    Title: "",
    Item: "t3 item",
    Source: "Something else",
    Description: "Test Desc",
    Type: "CLUE",
    Bounty: "1M",
    Wiki_URL: "https://oldschool.runescape.wiki/w/Cadantine",
    Status: "Active",
    Other: "",
    Player_Name: "",
    S3_URL: "",
    Quantity: 0,
    Sheet_Index: 2,
    Wiki_Image: "https://oldschool.runescape.wiki/images/Cadantine.png",
  },
];
// export const cachedBounties = [];
//Faster way to check if a part of the bounties
//Maybe objects {type: "LOOT", targets: []}
export const simpleBounties = [];

//holds all sheet objects
export const cachedSheets = [];

//holds current highscores created by parsing sheets data
export const highscores = [];
