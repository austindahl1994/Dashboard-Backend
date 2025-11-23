import { Details, RankEmbed } from "./rankTypes.ts";

export const calcHybrid = (): RankEmbed => {
  try {
    const title = "Hybrid Path";
    const description =
      "Once implemented, this will compare PvM, Skilling, and Community rank to determine Hybrid rank";
    const detailMap: string[] = ranksList.map((rankStr, index) => {
      const icon = index <= 2 ? "✅" : "❌";
      return `${icon} ${rankStr}`;
    });
    const finalDetail: Details = { header: "Ranks", fields: detailMap };
    const details: Details[] = [finalDetail];
    return { title, description, details, rank: ranks[2] };
  } catch (error) {
    throw error;
  }
};
const ranks = ["Seasoned", "Achiever", "Elite", "Completionist", "Perfect"];
const ranksList = [
  "Sentry, Gold, Tier 4",
  "Guardian, Mithril, Tier 5",
  "Warden, Adamant, Tier 6",
  "Vanguard, Rune, Tier 7",
  "Templar, Dragon, Tier 8",
];

/*
---------------------------
HYBRID
---------------------------
Sentry, Gold, Tier 4
Guardian, Mithril, Tier 5
Warden, Adamant, Tier 6
Vanguard, Rune, Tier 7
Templar, Dragon, Tier 8
*/
