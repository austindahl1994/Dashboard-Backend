import { calcCommunity } from "./community.ts";
import { calcHybrid } from "./hybrid.ts";
import { calcPVM } from "./pvm.ts";
import {
  CommunityRank,
  PlayerData,
  RankEmbed,
  RankInput,
  Skill,
} from "./rankTypes.ts";
import { calcSkilling } from "./skilling.ts";

// Community would need to return months in clan, along with tier obtained and array of strings to be used for community AND hybrid achieved/lacking

// What would I want the final embed to look like?
// Title is PvM, skilling, Hybrid (community is only used for hybrid??)
// Thumbnail is image of rank achieved
// ?? Description of what achieved, different for each (hybrid i might state the duration player has been in clan)
// Column with either checkmark or X next to rank requirements
// greenCheckmark emoji = '✅'
// redX emoji = '❌'
export const calcRank = async (data: RankInput): Promise<RankEmbed[]> => {
  try {
    const playerData: PlayerData = await getPlayerData(data.rsn);
    const communityTier: CommunityRank = calcCommunity(
      data.joinTime,
      data.events
    );
    // console.log(communityTier);
    const pvmRank: RankEmbed = calcPVM(
      data.firecape,
      data.quiverOrInfernal,
      data.combatAchievements,
      playerData.activities.slice(20)
    );
    const skillingRank: RankEmbed = calcSkilling(
      playerData.skills,
      data.diaries
    );
    // const hybridRank: RankEmbed = calcHybrid(communityTier, skillingRank, pvmRank);
    const hybridRank: RankEmbed = calcHybrid(
      communityTier,
      skillingRank?.rankIndex || 0,
      pvmRank?.rankIndex || 0
    );
    return [pvmRank, skillingRank, hybridRank];
    // return [skillingRank, pvmRank, hybridRank];
  } catch (error) {
    throw error;
  }
};

const getPlayerData = async (rsn: string): Promise<PlayerData> => {
  try {
    const encodedRSN = encodeURIComponent(rsn);
    const response = await fetch(
      `https://secure.runescape.com/m=hiscore_oldschool/index_lite.json?player=${encodedRSN}`
    );
    const playerData = await response.json();
    return playerData;
  } catch (error) {
    throw error;
  }
};

/*
{
  name: 'itzdubz',
  skills: [
    { id: 0, name: 'Overall',rank: 301789, level: 2076,xp: 198929132 },
    { id: 1, name: 'Attack', rank: 242406, level: 99, xp: 14729531 },
    { id: 2, name: 'Defence', rank: 346387, level: 99, xp: 13116818 },
    { id: 3, name: 'Strength', rank: 243135, level: 99, xp: 18633220 },
    { id: 4, name: 'Hitpoints', rank: 214996, level: 99, xp: 29699344 },
    { id: 5, name: 'Ranged', rank: 249984, level: 99, xp: 23249854 },
    { id: 6, name: 'Prayer', rank: 228908, level: 94, xp: 8109678 },
    { id: 7, name: 'Magic', rank: 267950, level: 99, xp: 15832759 },
    { id: 8, name: 'Cooking', rank: 749132, level: 86, xp: 3602456 },
    { id: 9, name: 'Woodcutting', rank: 162502, level: 99, xp: 13164761 },
    { id: 10, name: 'Fletching', rank: 755358, level: 81, xp: 2217325 },
    { id: 11, name: 'Fishing', rank: 468949, level: 86, xp: 3717556 },
    { id: 12, name: 'Firemaking', rank: 743244, level: 86, xp: 3601449 },   
    { id: 13, name: 'Crafting', rank: 329089, level: 91, xp: 6256682 },
    { id: 14, name: 'Smithing', rank: 488562, level: 83, xp: 2699108 },
    { id: 15, name: 'Mining', rank: 477015, level: 85, xp: 3371888 },
    { id: 16, name: 'Herblore', rank: 255714, level: 90, xp: 5647554 },
    { id: 17, name: 'Agility', rank: 336743, level: 84, xp: 3030580 },
    { id: 18, name: 'Thieving', rank: 454427, level: 83, xp: 2774244 },
    { id: 19, name: 'Slayer', rank: 288810, level: 96, xp: 10124785 },
    { id: 20, name: 'Farming', rank: 413349, level: 94, xp: 8136417 },
    { id: 21, name: 'Runecraft', rank: 479627, level: 76, xp: 1357302 },
    { id: 22, name: 'Hunter', rank: 442459, level: 82, xp: 2567622 },
    { id: 23, name: 'Construction', rank: 324585, level: 85, xp: 3288199},
    { id: 24, name: 'Sailing', rank: -1, level: 1, xp: 0 }
  ],
  activities: [
    { id: 0, name: 'Grid Points', rank: -1, score: -1 },
    { id: 1, name: 'League Points', rank: -1, score: -1 },
    { id: 2, name: 'Deadman Points', rank: -1, score: -1 },
    { id: 3, name: 'Bounty Hunter - Hunter', rank: -1, score: -1 },
    { id: 4, name: 'Bounty Hunter - Rogue', rank: -1, score: -1 },
    { id: 5, name: 'Bounty Hunter (Legacy) - Hunter', rank: -1, score: -1},
    { id: 6, name: 'Bounty Hunter (Legacy) - Rogue',rank: -1,score: -1},
    { id: 7, name: 'Clue Scrolls (all)', rank: 325455, score: 211 },
    { id: 8, name: 'Clue Scrolls (beginner)', rank: -1, score: -1 },
    { id: 9, name: 'Clue Scrolls (easy)', rank: 1005580, score: 4 },
    { id: 10, name: 'Clue Scrolls (medium)', rank: 343628, score: 42 },
    { id: 11, name: 'Clue Scrolls (hard)', rank: 268538, score: 102 },
    { id: 12, name: 'Clue Scrolls (elite)', rank: 114588, score: 47 },
    { id: 13, name: 'Clue Scrolls (master)', rank: 151171, score: 16 },
    { id: 14, name: 'LMS - Rank', rank: -1, score: -1 },
    { id: 15, name: 'PvP Arena - Rank', rank: -1, score: -1 },
    { id: 16, name: 'Soul Wars Zeal', rank: -1, score: -1 },
    { id: 17, name: 'Rifts closed', rank: -1, score: -1 },
    { id: 18, name: 'Colosseum Glory', rank: 41777, score: 36742 },
    { id: 19, name: 'Collections Logged', rank: -1, score: -1 },
     -----------------------------------------------------------
    |                      BOSSING DATA                       |
    -----------------------------------------------------------
    { id: 20, name: 'Abyssal Sire', rank: 255710, score: 50 },
    { id: 21, name: 'Alchemical Hydra', rank: 226758, score: 107 },
    { id: 22, name: 'Amoxliatl', rank: -1, score: -1 },
    { id: 23, name: 'Araxxor', rank: 129900, score: 213 },
    { id: 24, name: 'Artio', rank: 134640, score: 20 },
    { id: 25, name: 'Barrows Chests', rank: 351749, score: 181 },
    { id: 26, name: 'Bryophyta', rank: 337527, score: 5 },
    { id: 27, name: 'Callisto', rank: -1, score: -1 },
    { id: 28, name: "Calvar'ion", rank: 213106, score: 20 },
    { id: 29, name: 'Cerberus', rank: -1, score: -1 },
    { id: 30, name: 'Chambers of Xeric', rank: 59697, score: 395 },
    { id: 31, name: 'Chambers of Xeric: Challenge Mode', rank: 44809, score: 51 },
    { id: 32, name: 'Chaos Elemental', rank: 164636, score: 26 },
    { id: 33, name: 'Chaos Fanatic', rank: 240425, score: 25 },
    { id: 34, name: 'Commander Zilyana', rank: 132078, score: 127 },
    { id: 35, name: 'Corporeal Beast', rank: 158749, score: 30 },
    { id: 36, name: 'Crazy Archaeologist', rank: 354460, score: 25 },
    { id: 37, name: 'Dagannoth Prime', rank: -1, score: -1 },
    { id: 38, name: 'Dagannoth Rex', rank: -1, score: -1 },
    { id: 39, name: 'Dagannoth Supreme', rank: -1, score: -1 },
    { id: 40, name: 'Deranged Archaeologist', rank: 181980, score: 25 },
    { id: 41, name: 'Doom of Mokhaiotl', rank: -1, score: -1 },
    { id: 42, name: 'Duke Sucellus', rank: 134804, score: 59 },
    { id: 43, name: 'General Graardor', rank: 331253, score: 59 },
    { id: 44, name: 'Giant Mole', rank: 441872, score: 25 },
    { id: 45, name: 'Grotesque Guardians', rank: 273487, score: 50 },
    { id: 46, name: 'Hespori', rank: 382173, score: 31 },
    { id: 47, name: 'Kalphite Queen', rank: 347565, score: 5 },
    { id: 48, name: 'King Black Dragon', rank: 571076, score: 26 },
    { id: 49, name: 'Kraken', rank: 315452, score: 858 },
    { id: 50, name: "Kree'Arra", rank: 266161, score: 7 },
    { id: 51, name: "K'ril Tsutsaroth", rank: 221193, score: 43 },
    { id: 52, name: 'Lunar Chests', rank: 309709, score: 25 },
    { id: 53, name: 'Mimic', rank: 77828, score: 4 },
    { id: 54, name: 'Nex', rank: 91950, score: 167 },
    { id: 55, name: 'Nightmare', rank: 29342, score: 118 },
    { id: 56, name: "Phosani's Nightmare", rank: -1, score: -1 },
    { id: 57, name: 'Obor', rank: 374184, score: 5 },
    { id: 58, name: 'Phantom Muspah', rank: 192447, score: 31 },
    { id: 59, name: 'Sarachnis', rank: 325514, score: 25 },
    { id: 60, name: 'Scorpia', rank: 172969, score: 25 },
    { id: 61, name: 'Scurrius', rank: 366557, score: 20 },
    { id: 62, name: 'Shellbane Gryphon', rank: -1, score: -1 },
    { id: 63, name: 'Skotizo', rank: 227072, score: 27 },
    { id: 64, name: 'Sol Heredit', rank: -1, score: -1 },
    { id: 65, name: 'Spindel', rank: 135515, score: 20 },
    { id: 66, name: 'Tempoross', rank: 401106, score: 69 },
    { id: 67, name: 'The Gauntlet', rank: 330019, score: 5 },
    { id: 68, name: 'The Corrupted Gauntlet', rank: -1, score: -1 },
    { id: 69, name: 'The Hueycoatl', rank: -1, score: -1 },
    { id: 70, name: 'The Leviathan', rank: 58847, score: 57 },
    { id: 71, name: 'The Royal Titans', rank: 300230, score: 17 },
    { id: 72, name: 'The Whisperer', rank: 73759, score: 16 },
    { id: 73, name: 'Theatre of Blood', rank: 77339, score: 35 },
    { id: 74, name: 'Theatre of Blood: Hard Mode', rank: -1, score: -1},
    { id: 75, name: 'Thermonuclear Smoke Devil', rank: 307538, score: 20},
    { id: 76, name: 'Tombs of Amascut', rank: 148786, score: 40 },
    { id: 77, name: 'Tombs of Amascut: Expert Mode', rank: 114282, score: 36},
    { id: 78, name: 'TzKal-Zuk', rank: 88124, score: 1 },
    { id: 79, name: 'TzTok-Jad', rank: -1, score: -1 },
    { id: 80, name: 'Vardorvis', rank: 39881, score: 800 },
    { id: 81, name: 'Venenatis', rank: -1, score: -1 },
    { id: 82, name: "Vet'ion", rank: -1, score: -1 },
    { id: 83, name: 'Vorkath', rank: 494225, score: 74 },
    { id: 84, name: 'Wintertodt', rank: 654108, score: 174 },
    { id: 85, name: 'Yama', rank: 104760, score: 15 },
    { id: 86, name: 'Zalcano', rank: 195257, score: 49 },
    { id: 87, name: 'Zulrah', rank: 441269, score: 47 }
  ]
}
*/
