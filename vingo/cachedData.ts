// Update manually once event is going to start? Or could use discord command if need be
// Set true for testing
const EVENT_STARTED : boolean = true

interface Player {
  discord_username: string;
  discord_nickname: string;
  rsn: string;
  team: number;
  paid: boolean;
  donation: number;
}

interface Tile {
  id: number;
  title: string;
  description: string;
  source: string;
  items: Array<string>;
  tier: number;
  quantity: number;
  url: string;
}

// board keys are row number
const boardMap = new Map<number, Tile>();

// player keys are discord_ids
const playersMap = new Map<string, Player>();

// outer map number is team number, inner map number is tile id, array is RSN who have completed that tile by id
const completionsMap = new Map<number, Map<number, Array<string>>>()

export { Board, Players, Player, Tile, EVENT_STARTED }
