import { getFinalTasks } from "../../../services/google/osrsSheets.js";
import { getTier } from "../bounties/bountyUtilities.js";
//TODO: Add the "*" for anything if source is empty
// Second word being capital makes it not the same?

//Take in final tasklist, need following:
// How many times the items appear
// How many tasks are in each tier
export const finalTasks = async () => {
  try {
    const allTasks = await getFinalTasks(); //returned as array of arrays, headers are first row
    // console.log(`All final tasks: `);
    // console.log(allTasks); //[[[item1], [item2], [item3]],[[difficulty1],[difficulty2]]]
    const difficultyCount = new Map();
    const itemCounts = {};
    allTasks.forEach((col, index) => {
      if (index === 0) {
        col.forEach((item) => {
          if (!item || !item[0] || item[0].trim() === "") {
            return;
          }
          const itemString = item[0];
          if (itemString?.trim() !== "") {
            const items = itemString.split(",");
            items.forEach((i) => {
              let trimmedItem = i.trim().toLowerCase();
              if (itemCounts[trimmedItem]) {
                itemCounts[trimmedItem] += 1;
              } else {
                itemCounts[trimmedItem] = 1;
              }
            });
          }
        });
      }
      if (index === 1) {
        col.forEach((difficulty) => {
          if (
            !difficulty ||
            !difficulty[0] ||
            difficulty[0].trim() === "" ||
            difficulty[0] === "0"
          ) {
            return;
          }
          // console.log(`Difficulty: ${difficulty} type: ${typeof difficulty}`);
          // console.log(
          //   `Difficulty[0]: ${difficulty[0]} type: ${typeof difficulty[0]}`
          // );
          if (difficulty[0]?.trim()) {
            if (difficultyCount.has(difficulty[0])) {
              difficultyCount.set(
                difficulty[0],
                difficultyCount.get(difficulty[0]) + 1
              );
            } else {
              difficultyCount.set(difficulty[0], 1);
            }
          }
        });
      }
    });

    const itemsArr = Object.entries(itemCounts)
      .map(([item, count]) => {
        return {
          Item: item,
          Count: count,
        };
      })
      .sort((itemA, itemB) => {
        return itemA.Count - itemB.Count;
      });
    // console.log(`Entire difficultyCount map: `);
    // console.log(difficultyCount);
    const difficultyArr = [...difficultyCount]
      .map(([difficulty, count]) => {
        return {
          Difficulty: getTier(difficulty - 1),
          Count: count,
        };
      })
      .sort((arrObjA, arrObjB) => {
        return arrObjA.Count - arrObjB.Count;
      });
    console.log("Item totals: ");
    console.table(itemsArr);
    console.log("Number of tasks in tier: ");
    console.table(difficultyArr);
  } catch (error) {
    console.log(`Error calling finalTasks: `);
    console.log(error);
  }
};

// finalTasks();
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
