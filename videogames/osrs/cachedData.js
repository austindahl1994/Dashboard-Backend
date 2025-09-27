// ------------------
// LEAVING OFF TODOS
// ------------------
// Add cronjob for keeping track of number of requests to server based on player and/or discord
// Have different types of completion messages depending on type - Bounty completion specific to the task
// Fix updatePlayerActivity file, using players[rsn] whereas it should be players[username], using discord username
// Add /check command for players to check if they paid, their donation (if any), and what exact RSN we have for them
// Add trollish messages based on bountyType for completed bounties
// There was also something in manually completed, to parse through and find correct discord user?

export const EVENT_STARTED = true;

export const cachedBounties = [];

export const highscores = [];

// Number of bounties per tier, 3 is temporary, updates on sheet call
export const numberOfBounties = [3, 3, 3, 3, 3];

//array of player players that have made post requests
export let playerRequests = {};

// Username : {nickname: STR, id: INT, paid: BOOL YES/NO, donation: INT, time: INT, rsn: STR, team: STR, index: INT}]}
export const players = {};

// teamName : [playersOnTeam]
export const teams = {};

export let channelsCreated = true;

// {teamname: [category.id, text.id, voice.id]}
export const eventChannels = {};

export const recurring = {};

//holds current highscores created by parsing sheets data
// export const highscores = [
//   { Player_Name: "Happy", Score: 69, TotalBounty: 420.69 },
//   { Player_Name: "Thorn", Score: 24, TotalBounty: 4.5 },
//   { Player_Name: "Reagan", Score: 21, TotalBounty: 4.2 },
//   { Player_Name: "Vinny", Score: 18, TotalBounty: 3.9 },
//   { Player_Name: "Pubes", Score: 14, TotalBounty: 3.5 },
//   { Player_Name: "Yalongbone", Score: 11, TotalBounty: 2.5 },
//   { Player_Name: "Mason", Score: 10, TotalBounty: 1.75 },
//   { Player_Name: "Dubz", Score: 5, TotalBounty: 0.5 },
//   { Player_Name: "Kirk", Score: 2, TotalBounty: 0.005 },
//   { Player_Name: "Wash", Score: 1, TotalBounty: 0.002 },
// ];
//Holds all current bounty objects ()UPDATE TO EMPTY ON SERVER
// export const cachedBounties = [
//   {
//     Id: 1,
//     Difficulty: "easy",
//     Title: "Mind Goblin",
//     Item: ["Goblin mail", "Goblin champion scroll"],
//     Source: "goblin",
//     Description: "Mind goblin on these...",
//     Type: "loot",
//     Bounty: "0.005",
//     Wiki_URL: "https://oldschool.runescape.wiki/w/Goblin",
//     Status: "Active",
//     Other: "",
//     RSN: "",
//     Discord: "",
//     S3_URL: "",
//     Sheet_Index: 2,
//     Wiki_Image: "https://oldschool.runescape.wiki/images/Goblin.png",
//     Tier_completed: false,
//     Completed: false,
//   },
//   {
//     Id: 1,
//     Difficulty: "medium",
//     Title: "Graardor Assault",
//     Item: [
//       "Bandos hilt",
//       "Bandos tassets",
//       "Bandos boots",
//       "Bandos chestplate",
//     ],
//     Source: "General Graardor",
//     Description: "No desc yet",
//     Type: "loot",
//     Bounty: "1.5",
//     Wiki_URL: "https://oldschool.runescape.wiki/w/God_Wars_Dungeon",
//     Status: "Active",
//     Other: "",
//     RSN: "",
//     Discord: "",
//     S3_URL: "",
//     Sheet_Index: 2,
//     Wiki_Image: "https://oldschool.runescape.wiki/images/God_Wars_Dungeon.png",
//     Tier_completed: false,
//     Completed: false,
//   },
//   {
//     Id: 2,
//     Difficulty: "hard",
//     Title: "",
//     Item: ["hard item"],
//     Source: "Something else",
//     Description: "Test Desc",
//     Type: "clue",
//     Bounty: "1",
//     Wiki_URL: "https://oldschool.runescape.wiki/w/Cadantine",
//     Status: "Active",
//     Other: "",
//     RSN: "",
//     Discord: "",
//     S3_URL: "",
//     Sheet_Index: 3,
//     Wiki_Image: "https://oldschool.runescape.wiki/images/Cadantine.png",
//     Tier_completed: false,
//     Completed: false,
//   },
//   {
//     Id: 1,
//     Difficulty: "elite",
//     Title: "",
//     Item: ["elite item"],
//     Source: "9775",
//     Description: "Seek death as title",
//     Type: "death",
//     Bounty: "0.5",
//     Wiki_URL:
//       "https://cabbage-bounty.s3.us-east-2.amazonaws.com/Seeking+Death+Images/testss.png",
//     Status: "Active",
//     Other: "",
//     RSN: "",
//     Discord: "",
//     S3_URL: "",
//     Sheet_Index: 2,
//     Wiki_Image:
//       "https://cabbage-bounty.s3.us-east-2.amazonaws.com/Seeking+Death+Images/testss.png",
//     Tier_completed: false,
//     Completed: false,
//   },
//   {
//     Id: 2,
//     Difficulty: "master",
//     Title: "",
//     Item: ["More Items"],
//     Source: "Something else",
//     Description: "Test Desc",
//     Type: "clue",
//     Bounty: "1",
//     Wiki_URL: "https://oldschool.runescape.wiki/w/Verzik_Vitur",
//     Status: "Active",
//     Other: "",
//     RSN: "",
//     Discord: "",
//     S3_URL: "",
//     Sheet_Index: 3,
//     Wiki_Image: "https://oldschool.runescape.wiki/images/Verzik_Vitur.png",
//     Tier_completed: false,
//     Completed: false,
//   },
// ];
