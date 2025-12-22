export interface Tile {
  id: number; // actual tile id, starting 0, not row position in sheet
  title: string;
  description: string;
  source: string;
  items: string[];
  tier: number;
  quantity: number;
  url: string;
}
