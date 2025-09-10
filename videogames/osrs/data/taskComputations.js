import {
  getFinalTasks,
  migrateTasks,
} from "../../../services/google/osrsSheets.js";
import { getTier } from "../bounties/bountyUtilities.js";

const FINAL_TASKS_LENGTH = 300;
const MAX_TASKS_IN_TIER = 100;

//Take in final tasklist, need following:
// How many times the items appear
// How many tasks are in each tier
export const finalTasks = async () => {
  try {
    const allItems = new Set([]);
    const range = [
      `final!B2:B${FINAL_TASKS_LENGTH}`,
      `final!F2:F${FINAL_TASKS_LENGTH}`,
    ];
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
              allItems.add(trimmedItem);
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
    console.log("All items: ");
    console.log([...allItems].sort().join(", "));
  } catch (error) {
    console.log(`Error calling finalTasks: `);
    console.log(error);
  }
};

//TODO: Add PK tasks based on what adam said
//TODO: Add seaking death tasks
//TODO: Remove anything from source unless it has a specific source!
//TODO: Update bountyCompletion embeds to represent correct task, maybe include difficulty, team name, etcAdded merging of finalTasks into each individual task sheet
export const mergeFinalTasks = async () => {
  try {
    const tasks = Array.from({ length: 5 }).map(() => []);
    const finalTasks = await getFinalTasks(`final!A2:H${FINAL_TASKS_LENGTH}`); //[[sheet [data]]]
    console.log(`Final tasks retrieved: ${finalTasks.length}`);
    finalTasks[0].forEach(
      ([title, items, source, description, type, difficulty, url, other]) => {
        //index: Title, Items, Source, Description, Type, Difficulty, Other, Wiki_URL
        tasks[difficulty - 1].push([
          title || "",
          items || "",
          source || "",
          description || "",
          type,
          0,
          url || "",
          other || "",
        ]);
      }
    );
    const ranges = Array.from({ length: 5 }).map(
      (_, i) => `${getTier(i)}!A2:H${MAX_TASKS_IN_TIER}`
    );
    console.log(`Ranges to merge final tasks into: `);
    console.log(ranges);
    // console.log(`Tasks to merge: `);
    // console.log(tasks);
    tasks.forEach((group, i) => {
      tasks[i] = shuffle(group);
    });

    const batchedData = ranges.map((range, index) => {
      return {
        range: range,
        values: tasks[index],
      };
    });
    await migrateTasks(batchedData);
  } catch (error) {
    console.log(`Error merging tasks: ${error}`);
    throw error;
  }
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick random index
    [array[i], array[j]] = [array[j], array[i]]; // swap
  }
  return array;
};
