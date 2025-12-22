import { CommunityRank, Details, RankEmbed } from "./rankTypes.ts";

export const calcHybrid = (
  community: CommunityRank,
  skillingRankIndex: number,
  pvmRankIndex: number
): RankEmbed => {
  try {
    // console.log(`Tiers passed in:`);
    // console.log(
    //   `Community: ${community.tier}, Skilling: ${skillingRankIndex}, PvM: ${pvmRankIndex}`
    // );

    const minimumIndex = Math.min(
      community.tier,
      skillingRankIndex,
      pvmRankIndex
    ); // results in 0, 1, 2, 3, ..., 8
    // console.log(`Minimum tier:`);
    // console.log(minimumIndex);
    const years = Math.floor((Number(community.months) || 0) / 12);
    const months = (Number(community.months) || 0) % 12;
    const rankStr = ranks[minimumIndex - 4] || "Unknown";
    const yearsStr =
      years === 0 ? "" : years !== 1 ? `${years} years,` : "1 year,";
    const monthsStr = months !== 1 ? "months" : "month";
    const title = "Hybrid Path";
    if (minimumIndex < 4) {
      return {
        title,
        description: `**${yearsStr} ${months} ${monthsStr}** in Cabbage but lacking requirements for Hybrid rank.\nPVM tier: **${pvmRankIndex}**, skilling tier: **${skillingRankIndex}**, community tier: **${community.tier}** but require a minimum of 4 in all.`,
        details: [],
        rank: "Competitor",
      };
    }
    const description = `**${yearsStr} ${months} ${monthsStr}** in Cabbage and achieved **${rankStr.toUpperCase()}** Hybrid rank!`;
    let rankIndexAchieved: number = 0;
    const detailMap: string[] = ranksList.map((rankStr, index) => {
      const icon = index <= minimumIndex - 4 ? "✅" : "❌";
      rankIndexAchieved = index <= minimumIndex - 4 ? index : rankIndexAchieved;
      return `${icon} ${rankStr}`;
    });
    const finalDetail: Details = { header: "Ranks", fields: detailMap };
    const details: Details[] = [finalDetail];
    return { title, description, details, rank: ranks[rankIndexAchieved] };
  } catch (error) {
    throw error;
  }
};
const ranks = ["Seasoned", "Achiever", "Elite", "Completionist", "Perfect"];
const ranksList = [
  "Seasoned, Gold, Tier 4",
  "Achiever, Mithril, Tier 5",
  "Elite, Adamant, Tier 6",
  "Completionist, Rune, Tier 7",
  "Perfect, Dragon, Tier 8",
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
