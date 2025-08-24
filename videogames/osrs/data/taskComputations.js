import { getFinalTasks } from "../../../services/google/osrsSheets.js"
//TODO: Add the "*" for anything if source is empty


//Take in final tasklist, add in every item, see how many times they appear, see how many tasks are for each tier
const finalTasks = async () => {
  try {
    const allTasks = await getFinalTasks() //returned as array, headers are first element?
    const allTasksObj = {} //Keys will be 
    const allItems = {}
    allTasks.forEach((rowArr, index) => {
      // Check for first index, which will be the header row
      if (index === 0) {
        rowArr.forEach((rowStr) => {
          //Add row as key for tasksObj? Or use difficulty (tier to difficulty)
        })
      } else {
        // Not header row, add information to objects based on data
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
