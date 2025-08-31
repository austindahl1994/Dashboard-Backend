import { getFinalTasks, migrateTasks } from "../../../services/google/osrsSheets.js";
import { getTier } from "../bounties/bountyUtilities.js";

const FINAL_TASKS_LENGTH = 180
const MAX_TASKS_IN_TIER = 100
//Take in final tasklist, need following:
// How many times the items appear
// How many tasks are in each tier
export const finalTasks = async () => {
  try {
    const allItems = new Set([])
    const range = ["final!B2:B400", "final!F2:F400"];
    const allTasks = await getFinalTasks(range); //returned as array of arrays, headers are first row
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
              let trimmedItem = i.trim().toLowerCase().replace(/[’‘]/g, "'");
              allItems.add(trimmedItem)
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
    console.log("All items: ")
    console.log([...allItems].sort().join(", "))
  } catch (error) {
    console.log(`Error calling finalTasks: `);
    console.log(error);
  }
};

//TODO: Add actual logic to migrateTasks
//TODO: Add PK tasks based on what adam said
//TODO: Add seaking death tasks
//TODO: Remove anything from source unless it has a specific source!
//TODO: Update bountyCompletion embeds to represent correct task, maybe include difficulty, team name, etcAdded merging of finalTasks into each individual task sheet
const mergeFinalTasks = async () => {
  try {
    const tasks = Array.from({length: 5}).map(() => [])
    const finalTasks = await getFinalTasks([`final!A2:H${FINAL_TASKS_LENGTH}`]);
    finalTasks.forEach(([title, items, source, description, type, difficulty, other, url]) => {
      //index: Title, Items, Source, Description, Type, Difficulty, Other, Wiki_URL
      tasks[difficulty - 1].push([
        title, items, source, description, type, 0, url, other
      ])
    })
    const ranges = Array.from({ length: 5 }).map((_, i) => `${getTier(i)}:A2:H${MAX_TASKS_IN_TIER}`)
    const batchedData = ranges.map((range, index) => {
      return {
        range: range,
        values: tasks[index]
      }
    })
    await migrateTasks(batchedData)
  } catch (error) {
    console.log(`Error merging tasks: ${error}`)
    throw error
  }
}
