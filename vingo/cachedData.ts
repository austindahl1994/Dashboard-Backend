interface Player {
  discord_username: string;
  discord_nickname: string;
  rsn: string;
  team: number;
  paid: boolean;
  donation: number;
}

interface Board {
  id: number;
  title: string;
  description: string;
  source: string;
  items: Array<string>;
  category: string;
  tier: number;
  quantity: number;
  url: string;
}

let Board = new Map<number, Board>();
let Players = new Map<string, Player>();
