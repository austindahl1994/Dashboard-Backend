import { skipBounty } from "../../../services/google/osrsSheets.js";
import { cachedBounties } from "../cachedData.js";
import { difficultyToTier, tasksLeft } from "./bountyUtilities.js";

export const skipTask = async (taskDifficulty) => {
  try {
    if (cachedBounties.length === 0) {
      throw new Error("No cached bounties to skip.");
    }
    const dataToWrite = [];
    const dataToRead = [];
    const difficultiesAdded = [];
    const rowIndexes = [];
    // SKIP TASKS OF ONE DIFFICULTY
    if (taskDifficulty !== "all") {
      // console.log(`Skipping task of difficulty: ${taskDifficulty}`);
      const tier = difficultyToTier(taskDifficulty);
      // console.log(`type of tier: ${typeof tier}, value: ${tier}`);
      if (tier === 5 || tier === undefined) {
        throw new Error(`Invalid tier passed in: ${taskDifficulty}`);
      }
      const bounty = cachedBounties[tier];
      if (!bounty || bounty.Tier_completed) {
        throw new Error(
          `No active task found for tier: ${taskDifficulty} so cannot skip.`
        );
      }
      dataToWrite.push(...setSheetSkipData(bounty));
      dataToRead.push(
        `${bounty.Difficulty}!A${bounty.Sheet_Index + 1}:H${
          bounty.Sheet_Index + 1
        }`
      );
      difficultiesAdded.push(bounty.Difficulty);
      rowIndexes.push(bounty.Sheet_Index);
      // SKIP ALL TASKS
    } else {
      console.log("Skipping all tasks");
      cachedBounties.forEach((bounty) => {
        if (bounty.Tier_completed) {
          return;
        }
        dataToWrite.push(...setSheetSkipData(bounty));
        dataToRead.push(
          `${bounty.Difficulty}!A${bounty.Sheet_Index + 1}:H${
            bounty.Sheet_Index + 1
          }`
        );
        difficultiesAdded.push(bounty.Difficulty);
        rowIndexes.push(bounty.Sheet_Index);
      });
    }
    // console.log(`Will be skipping/Updating this data: `);
    // console.log(dataToWrite);
    // console.log(`Will be reading this data: `);
    // console.log(dataToRead);
    await skipBounty(dataToWrite, dataToRead, difficultiesAdded, rowIndexes);
  } catch (error) {
    throw error;
  }
};

// returns array of two objects, first is the skipped task, second is the next active task (if it exists)
const setSheetSkipData = (bounty) => {
  const defaultValues = ["SKIPPED", "", "", "", "SKIPPED"];
  bounty.Completed = true;
  bounty.Status = "SKIPPED";
  const skippedObj = {
    range: `${bounty.Difficulty}!I${bounty.Sheet_Index}:M${bounty.Sheet_Index}`,
    values: [defaultValues],
  };
  if (tasksLeft(bounty.Sheet_Index + 1, bounty.Difficulty)) {
    const nextActiveTask = {
      range: `${bounty.Difficulty}!I${bounty.Sheet_Index + 1}`,
      values: [["Active"]],
    };
    return [skippedObj, nextActiveTask];
  }
  return [skippedObj];
};
