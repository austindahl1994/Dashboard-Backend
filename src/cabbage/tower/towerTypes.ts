export interface Adventurer {
  id: number;
  rsn: string;
  currentFloor: number;
  item: string;
  discordId?: string | null;
  discordAvatar: string | null;
}

// First completion data for each floor, used for SSE after a completion
export interface TowerFloor {
  cabbageId?: number;
  floor?: number;
  rsn: string;
  url?: string | null;
}

// Data inside each placements array
export type TowerLayoutPlacement = {
  floor: number;
  slot: number;
  title: string;
  items: string[];
  tile?: {
    id?: string;
    name?: string;
    type?: string;
    tier?: string;
  };
};

// Initial data has floors count and quantity of Towers, only need placements for the Tower layout, which is an array of TowerLayoutPlacement objects
export type TowerLayoutData = {
  floors?: number;
  quantity?: number;
  placements?: TowerLayoutPlacement[];
};

export type PlacementsMap = Map<number, ReducedPlacements>;

export type ReducedPlacements = {
  items: Set<string>;
  bosses: string[];
};
