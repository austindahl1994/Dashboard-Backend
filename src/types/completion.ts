export interface Completion {
  team: number;
  tile_id: number;
  rsn: string;
  url: string | null;
  item: string;
  obtained_at?: string;
}

// Added simple completion for caching purposes, dont need to cache team and tile_id again, team is used in outter map as key, tile_id is used as key in inner map
export interface SimpleCompletion {
  rsn: string;
  url?: string;
  item: string;
  obtained_at?: string;
}
// id: number auto_increments, team: number, tile_id: number, rsn: string, url: string, item: array, obained_at: string

// Used in 2 instances:
// 1. Array of completions created when tiles match, add AWS URL for each completion
// 2. (Even needed?) GET request made to completions database
