export interface Tile {
  id: number;
  title: string;
  description: string;
  source: string;
  items: Array<string>;
  tier: number;
  quantity: number;
  url: string;
}
