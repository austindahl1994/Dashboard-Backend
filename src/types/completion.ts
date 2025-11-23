export interface Completion {
  id?: number;
  team: number;
  tile_id: number;
  rsn: string;
  url?: string;
  item: string;
  obtained_at: string;
}
// id: number auto_increments, team: number, tile_id: number, rsn: string, url: string, item: array, obained_at: string

// Used in 2 instances:
// 1. Array of completions created when tiles match, add AWS URL for each completion
// 2. (Even needed?) GET request made to completions database
