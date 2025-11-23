import { CommunityRank } from "./rankTypes.ts";

export const calcCommunity = (
  joinedTime: Date,
  eventsNumber: number
): CommunityRank => {
  try {
    const monthsInClan = calcTime(joinedTime);

    // Using months in clan, get the highest tier index from monthTiers
    let monthTierIndex = 0;
    for (let i = 0; i < monthTiers.length; i++) {
      if (monthsInClan >= monthTiers[i]) {
        monthTierIndex = i;
      }
    }
    let communityTier = 0;
    if (monthTierIndex === 8 && eventsNumber >= 7) {
      communityTier = 8;
    } else {
      communityTier = Math.min(monthTierIndex, eventsNumber);
    }
    return { months: monthsInClan, tier: communityTier };
    // Compare monthsInClan and eventsNumber to rank tiers
    // events will never be 7, since 7 and 8 only differ by month
  } catch (error) {
    throw error;
  }
};

const calcTime = (joinTime: Date) => {
  try {
    // Calculate the time difference
    const now = new Date();

    // Extract year and month of both current date and the join date
    const joinYear = joinTime.getFullYear();
    const joinMonth = joinTime.getMonth(); // Month is 0-indexed, so January is 0, December is 11
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Calculate the difference in months
    const monthsDifference =
      (currentYear - joinYear) * 12 + (currentMonth - joinMonth);
    console.log(`Months in clan: ${monthsDifference}`);

    return monthsDifference;
  } catch (error) {
    throw error;
  }
};

const monthTiers: number[] = [0, 1, 2, 3, 6, 9, 12, 18, 24];

// const monthStrings: string[] = [
//   "You have not been in the clan long enough",
//   "1 Month in Clan",
//   "2 Months in Clan",
//   "3 Months in Clan",
//   "6 Months in Clan",
//   "9 Months in Clan",
//   "12 Months in Clan",
//   "18 Months in Clan",
//   "24 Months in Clan",
// ];
// const eventStrings: string[] = [
//   "2 Events Participated In",
//   "4 Events Participated In",
//   "6 Events Participated In",
//   "12 Events Participated In",
//   "15 Events Participated In",
//   "15 Events + 1 Bingo Participated In",
//   "15 Events + 1 Bingo + Invited a Friend",
// ];

/*
    ---------------------------
    COMMUNITY 
    ---------------------------
    tier 0: 0 months OR 0 events
    tier 1: 1 month OR 2 events
    tier 2: 2 OR 4 events
    tier 3: 3 months OR 6 events
    tier 4: 6 months OR 12 events
    tier 5: 9 months AND 15 events
    tier 6: 12 months AND 1 bingo + 15 events 
    tier 7: 18 months AND 1 bingo + 15 events 
    tier 8: 24 months AND invited a friend + 1 bingo + 15 events 
     */
