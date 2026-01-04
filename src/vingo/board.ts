import { boardMap } from "./cachedData.js";
import { getVingoBoard } from "../services/google/vingoBoard.js";
import { Tile } from "@/types/tile.js";

const headers: string[] = [
  "id",
  "title",
  "description",
  "source",
  "items",
  "tier",
  "quantity",
  "url",
];

export const getBoard = async (): Promise<object | undefined> => {
  try {
    if (boardMap.size === 0) {
      await cacheBoard();
    }
    // return Object.fromEntries(boardMap);
    const boardArr: any[] = [];
    Array.from({ length: boardMap.size }).forEach((_, i) => {
      const tile = boardMap.get(i + 1);
      if (!tile) throw new Error(`Tile with id ${i + 1} not found in boardMap`);
      // Return all of tile but without row property, add id property
      const { row, ...rest } = tile;
      const finalTile = { ...rest, id: i + 1 };
      boardArr[tile?.row! - 2] = finalTile;
    });
    return boardArr;
    // return Array.from(boardMap.values());
  } catch (error) {}
};

export const cacheBoard = async (): Promise<void> => {
  try {
    if (boardMap.size !== 0) {
      console.log(`Board size not 0, clearing`);
      boardMap.clear();
      console.log(`After clear: ${boardMap.size}`);
    }
    const boardData: string[][] = await getVingoBoard();
    updateCachedBoard(boardData);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

// After board data is pulled, update cached board data
const updateCachedBoard = (boardData: string[][]) => {
  try {
    boardData.forEach((rowArr: string[], rowIndex: number) => {
      const tileObj: any = {};
      headers.forEach((header, colIndex) => {
        let mapID: number | null = null;
        const value = rowArr[colIndex];

        switch (header) {
          case "id":
            mapID = value ? Number(value) : null;
            break;
          case "tier":
          case "quantity":
            tileObj[header] = value ? Number(value) : 0;
            break;
          case "items":
            tileObj[header] = value
              ? value.split(",").map((s) => s.trim())
              : [];
            break;
          case "source":
            tileObj[header] = value.toLowerCase();
            break;
          default:
            tileObj[header] = value;
        }
        if (mapID === null)
          throw new Error(`Tile ID is null at row ${rowIndex}`);
        tileObj.row = rowIndex + 2; // +2 to account for header which starts at 1, data at 2
        const tile: Tile = tileObj;
        boardMap.set(mapID, tile);
      });
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

// Not used currently, but will be when we are looking over all items for verifying spelling
export const getAllBoardItems = (): string[] => {
  try {
    const allItems: Set<string> = new Set();
    for (const [_, tile] of boardMap) {
      tile.items.forEach((item) => {
        allItems.add(item);
      });
    }
    console.log(`All items:`);
    console.log(`${[...allItems].join(", ")}`);
    return [...allItems];
  } catch (error) {
    throw error;
  }
};

// When player completion data is stored, also store the board_id in row
// Called when team data is gotten
// Passed in all data for that team, will calc points based on cached board data
// export const calcPoints = (team: Array<object>): Array<number> => {
//   try {
//     for (const [index, tile] of board) {
//     }
//     // Compare team data against cached board
//     // Check rows, use tile key from board
//     // Check cols, use tile id from board
//   } catch (e) {
//     console.log(e);
//     throw e;
//   }
// };

// Single sheet returned data:
// [
//   ["id", "title", "description", "source", "items", "tier", "quantity", "url"],
//   ["1", "temp", "something", "", "item1, item2", "1", "3", "www.example"]
// ]
