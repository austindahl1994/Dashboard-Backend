export interface Packs {
  bossPack: string;
  extraPack: string;
  coins: number;
}

export type CardFinish = "normal" | "shiny" | "negative";

export type PackCardRarity = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PackCard {
  name: string;
  rarity: number;
  type: string;
  url?: string;
  description?: string;
  shiny?: boolean;
}

export interface OpenedCard extends PackCard {
  finish: CardFinish;
  shiny: boolean;
}

export interface PackInventoryQuantity {
  packName: string;
  quantity: number;
}

export interface CardInventory {
  cabbageId: number;
  coins: number;
  packs: PackInventoryQuantity[];
}

export interface CollectedCard {
  id: number;
  cabbageId: number;
  cardName: string;
  quantity: number;
  shinyQuantity: number;
  negativeQuantity: number;
  lastObtainedAt: Date | null;
}
