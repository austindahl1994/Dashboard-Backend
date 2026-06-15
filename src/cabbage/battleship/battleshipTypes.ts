export interface BattleshipCell {
  id: number;
  item: string;
  itemURL: string;
  coord: string;
  obtained: boolean;
  hit: boolean;
}

// In the case of ID, could just have a dictionary of cellID to item and url instead of storing in the cell itself or in JS it's a Map<number, {item: string, url: string}>. Would save space and make it easier to update items/urls if needed
export interface Ship {
  cell: string; //Or just ID if you want
  item: string;
}

// dingy1 = [{cell: "A1", item: "Example Item"}, {cell: "A2", item: "Example Item 2"}]
// INSERT INTO ships (cell, item) VALUES ("A1", "Example Item"), ("A2", "Example Item 2");
export interface PlayerBSData {
  id?: number;
  rsn: string;
  url: string;
}

/*
1. Get board from google sheets
2. Get player data from database
3. cache both
4. After caching, compare every board cell against player data, to see if obtained
*/
