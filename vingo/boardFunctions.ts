import { board, Tile } from "./cachedData.ts"
import { getVingoBoard } from "../serives/google/vingoBoard.ts"

const headers : Array<string> = ["id", "title", "description", "source", "items", "tier", "quantity", "url"]

export const cacheBoard = async (): Promise<void> => {
  try {
    if (!board || board.size === 0 ) {
      const boardData : Promise<Array<Array<string>>> = await getVingoBoard()
      formatBoard(boardData)
    } 
    return Object.fromEntries(board)
  } catch (e) {
    console.log(e)
    throw e
  }
}

// After board data is pulled, update cached board data
const updateCachedBoard = (boardData : Array<Array<string>>) => {
  try {
    board.clear()
    boardData.forEach((rowArr : Array<string>, rowIndex : number) => {
      const tileObj : any = {}
      headers.forEach((header, colIndex) => {
        const value = rowArr[colIndex]
        
        switch (header) {
          case "id":
          case "tier":
          case "quantity":
            tileObj[header] = value ? Number(value) : 0
            break;
          case "items":
            tileObj[header] = value ? value.split(",").map(s => s.trim()) : []
            break;
          default:
            tileObj[header] = value
        }

        const tile : Tile = tileObj
        board.set(rowIndex, tile)
      })
    })
  } catch (e) {
    console.log(e)
    throw e
  }
}

// When player completion data is stored, also store the board_id in row
// Called when team data is gotten
// Passed in all data for that team, will calc points based on cached board data
export const calcPoints = (team : Array<object>) : Array<number> => {
  try {
    for (const [index, tile] of board) {
      
    }
    // Compare team data against cached board
    // Check rows, use tile key from board
    // Check cols, use tile id from board
  } catch (e) {
    console.log(e)
    throw e
  }
}

// Single sheet returned data:
// [
//   ["id", "title", "description", "source", "items", "tier", "quantity", "url"],
//   ["1", "temp", "something", "", "item1, item2", "1", "3", "www.example"]
// ]
