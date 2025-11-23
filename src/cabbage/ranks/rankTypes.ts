// Input data from user to calc rank
export interface RankInput {
  rsn: string;
  firecape: boolean;
  quiverOrInfernal: boolean;
  combatAchievements:
    | "none"
    | "easy"
    | "medium"
    | "hard"
    | "elite"
    | "master"
    | "grandmaster";
  diaries: "none" | "easy" | "medium" | "hard" | "elite";
  events: number;
  joinTime: Date;
}

// What each embed will contain for each rank embed
export interface RankEmbed {
  title: string;
  description: string;
  details: Details[];
  rank: string;
}

export interface Details {
  header: string;
  fields: string[];
}

export interface CommunityRank {
  months: number;
  tier: number;
}

export interface PlayerData {
  name: string;
  skills: Skill[];
  activities: Activity[];
}

export interface Activity {
  id: number;
  name: string;
  rank: number;
  score: number;
}

export interface Skill {
  id: number;
  name: string;
  rank: number;
  level: number;
  xp: number;
}
