import { getFinalTasks } from "../../../services/google/osrsSheets.js"
import { getTier } from "../bounties/bountyUtilities.js"
//TODO: Add the "*" for anything if source is empty

//Take in final tasklist, need following:
// How many times the items appear
// How many tasks are in each tier
const finalTasks = async () => {
  try {
    const allTasks = await getFinalTasks() //returned as array of arrays, headers are first row
    const allTasks = {} 
    const allItems = {}
    allTasks.forEach((col, index) => { // [[col0:items],[col1:difficulty]]
      // Ignore the header row
      if (index !== 0) {
        // col[0] and col[1]: Items and Difficulty
        // Split each item in col[0] (items) by ',' if is more than one item
        if (col[0]?.trim() !== "") {
          
        }
        // Check if difficulty exists, if not add it
        if (col[1]?.trim()) {
          
        }
      }
    })
  } catch (error) {
    console.log(`Error calling finalTasks: `)
    console.log(error)
  }
}

finalTasks()
// export { getFinalTasks }

// Example returned data
// {
//   "range": "Sheet1!A1:C3",
//   "majorDimension": "ROWS",
//   "values": [
//     ["Name", "Age", "City"],
//     ["Alice", "25", "New York"],
//     ["Bob", "30", "London, New York"]
//   ]
// }
// For two cols example:
// [
//   ["Apple", "100"],
//   ["Banana", "200"],
//   ["Cherry", ""]
// ]
