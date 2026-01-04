export interface Tile {
  row: number; // row position in sheets
  title: string;
  description: string;
  source: string;
  items: string[];
  tier: number;
  quantity: number;
  url: string;
}
