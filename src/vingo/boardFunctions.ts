import { boardMap } from "./cachedData.js";
import { getVingoBoard } from "../services/google/vingoBoard.js";
import { Tile } from "@/types/tile.js";

const headers: Array<string> = [
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
    return Array.from(boardMap.values());
  } catch (error) {}
};

export const cacheBoard = async (): Promise<void> => {
  try {
    if (!boardMap || boardMap.size === 0) {
      const boardData: string[][] = await getVingoBoard();
      updateCachedBoard(boardData);
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

// After board data is pulled, update cached board data
const updateCachedBoard = (boardData: Array<Array<string>>) => {
  try {
    boardMap.clear();
    boardData.forEach((rowArr: Array<string>, rowIndex: number) => {
      const tileObj: any = {};
      headers.forEach((header, colIndex) => {
        const value = rowArr[colIndex];

        switch (header) {
          case "id":
          case "tier":
          case "quantity":
            tileObj[header] = value ? Number(value) : 0;
            break;
          case "items":
            tileObj[header] = value
              ? value.split(",").map((s) => s.trim())
              : [];
            break;
          case "url":
            tileObj[header] = value;
            break;
          default:
            tileObj[header] = value.toLowerCase();
        }

        const tile: Tile = tileObj;
        boardMap.set(rowIndex + 2, tile);
      });
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getAllBoardItems = (): string[] => {
  try {
    const allItems: Set<string> = new Set();
    for (const [_, tile] of boardMap) {
      tile.items.forEach((item) => {
        allItems.add(item);
      });
    }
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
