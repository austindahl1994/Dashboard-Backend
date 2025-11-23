import { Details, RankEmbed, Skill } from "./rankTypes.ts";

interface NonCbSkillXp {
  skill: string;
  xp: number;
}

export const calcSkilling = (skills: Skill[], diary: string): RankEmbed => {
  try {
    const nonCB: NonCbSkillXp = nonCbSkillXp(skills.slice(8));
    const overall: Skill = skills[0];
    const skillDetails: string[] = [];
    const details: Details[] = [];
    let highestRank: number = 0;
    let hitWall: boolean = false;
    ranks.forEach((rank, index) => {
      const meetsReq = checkRank(
        rank,
        overall.level,
        overall.xp,
        diary,
        nonCB.xp
      );
      const icon = meetsReq ? "✅" : "❌";
      skillDetails.push(`${icon} ${ranksList[index]}`);
      if (meetsReq && !hitWall) {
        highestRank = index + 1;
      } else {
        hitWall = true;
      }
    });
    const title = "Skilling Path";
    const rank = ranks[highestRank];
    const description = `You have achieved the **${rank}** rank in Skilling!`;
    details.push({ header: "Ranks", fields: skillDetails });
    return { title, description, details, rank };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const nonCbSkillXp = (nonCBSkills: Skill[]): NonCbSkillXp => {
  let skill = "";
  let xp = 0;
  nonCBSkills.forEach((s) => {
    if (s.xp > xp) {
      xp = s.xp;
      skill = s.name;
    }
  });
  return { skill, xp };
};

const checkRank = (
  rankName: string,
  totalLevel: number,
  totalXp: number,
  diary: string,
  nonCBXP: number
): boolean => {
  switch (rankName) {
    case "Bronze":
      return totalLevel >= 1000;
    case "Iron":
      return totalLevel >= 1500 && matchDiary(diary) >= 1;
    case "Steel":
      return totalLevel >= 1750 && matchDiary(diary) >= 2;
    case "Gold":
      return totalLevel >= 2000 && matchDiary(diary) >= 3;
    case "Mithril":
      return totalLevel >= 2100;
    case "Adamant":
      return totalLevel >= 2200 && matchDiary(diary) >= 4;
    case "Rune":
      return totalLevel >= 2277;
    case "Dragon":
      return (
        totalLevel >= 2277 && (totalXp >= 1000000000 || nonCBXP >= 75000000)
      );
    default:
      return false;
  }
};

const matchDiary = (diaries: string): number => {
  switch (diaries) {
    case "elite":
      return 4;
    case "hard":
      return 3;
    case "medium":
      return 2;
    case "easy":
      return 1;
    default:
      return 0;
  }
};

const ranks = [
  "Bronze",
  "Iron",
  "Steel",
  "Gold",
  "Mithril",
  "Adamant",
  "Rune",
  "Dragon",
];

const ranksList = [
  "Bronze: 1000 Total Level",
  "Iron: 1500 Total Level + Easy Diaries",
  "Steel: 1750 Total Level + Medium Diaries",
  "Gold: 2000 Total Level + Hard Diaries",
  "Mithril: 2100 Total Level",
  "Adamant: 2200 Total Level + Elite Diaries",
  "Rune: 2277 Total Level",
  "Dragon: 2277 Total Level **AND** \n1B total xp **OR** \n75m in 1x non cb-skill",
];
