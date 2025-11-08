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
let board = new Map<number, Tile>();

// player keys are discord_ids
let players = new Map<string, Player>();

export { Board, Players, Player, Tile, EVENT_STARTED }
