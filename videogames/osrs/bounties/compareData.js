import {
  cachedBounties,
  simpleSources,
  simpleItems,
  simpleTypes,
} from "../cachedData.js";

//If data doesn't match bounties, throw an error to immediately clear file data/image
//If after the await compareData(parsedData) no error thrown, then it matches a current Bounty

//Custom error thrown
const ce = (input) => {
  throw new Error(`Data ${input ? input : " "}did not match current bounties`);
};

const compareTypes = (type) => {
  if (!simpleTypes.includes(type)) {
    ce("Type");
  }
};

const compareItems = (itemsArr) => {
  let itemsMatch = false;
  for (let item of itemsArr) {
    if (simpleSources.includes(item)) {
      itemsMatch = true;
      return;
    }
  }

  if (!itemsMatch) {
    ce("Items");
  }
};

const compareSources = (source) => {
  if (!simpleSources.includes("*") && !simpleSources.includes(source)) {
    ce("Source");
  } else if (simpleSources.includes(source)) {
    cachedBounties.forEach((bounty) => {
      if (bounty.Source === source) {
        bounty.Quantity += 1;
      }
    });
  }
};

const compareRegions = (region, type) => {
  let regionsMatch = false;
  for (const bounty of cachedBounties) {
    if (bounty.Source === region) {
      regionsMatch = true;
    }
  }
  if (!regionsMatch) {
    ce("Region");
  }
};

//Do a check beforehand for extra.npc === false for guaranteed not pvp?
const loot = async (data) => {
  compareSources(data.extra.source);
  compareTypes(data.type);
  compareItems(data.extra.items);
};

const ba = async (data) => {
  compareTypes(data.type);
  compareItems(data.extra.items);
};

//Three types, pvp, pvm, and non-combat
const death = async (data) => {
  compareTypes(data.type);
  if (data.extra.isPvp === true) {
    //PVP death, do we care about this?
  } else if (data.content.killerNpcID) {
    //Death against NPC
  } else {
    //Death against non-combat, do we only care about this field?
  }
};

//Specific item OR all items priceEach sum being < or > some value OR single item priceEach < or > some value
const clue = async (data) => {
  compareTypes(data.type);
  // Since type came back positive, iterate through all Bounty objects to check the "Other" field for:
  // item, valueLess, valuegGreater, sumLess, sumGreater
  cachedBounties.forEach((bounty) => {
    if (bounty.Type === "CLUE") {
      let sum;
      switch (bounty.Other) {
        case "item":
          compareItems(data.extra.items);
          break;
        case "valueLess": // If lowest amount is not less than the wanted valueLess, send error
          const lowestAmount = data.extra.items.reduce((acc, item) => {
            return item.priceEach < acc ? item.priceEach : acc;
          }, Infinity);
          if (lowestAmount > parseFloat(bounty.Item[0]) * 1000000) {
            ce("Clue - valueLess");
          }
          break;
        case "valueGreater":
          const greatestAmount = data.extra.items.reduce((acc, item) => {
            return item.priceEach > acc ? item.priceEach : acc;
          }, -Infinity);
          if (geatestAmount < parseFloat(bounty.Item[0]) * 1000000) {
            ce("Clue - valueGreater");
          }
          break;
        case "sumLess":
          sum = data.extra.items.reduce((item, acc) => {
            return parseFloat(item.priceEach) + acc;
          }, 0);
          if (sunLess > parseFloat(bounty.Item[0]) * 1000000) {
            ce("Clue - sumLess");
          }
          break;
        case "sumGreater":
          sum = data.extra.items.reduce((item, acc) => {
            return parseFloat(item.priceEach) + acc;
          }, 0);
          if (sum < parseFloat(bounty.Item[0]) * 1000000) {
            ce("Clue - sumGreater");
          }
          break;
        default:
          throw new Error(
            `Invalid clue type in cachedBounties ${bounty.Other}`
          );
          break;
      }
    }
  });
};

const pet = async (data) => {
  //call get pet list, either increment count + 1 if exists under same discord/playername or create new + 1
};

// Time listed under Item[0], questName under Source
const speedrun = async (data) => {
  compareTypes(data.type);
  //check to see if quest is correct speedrun quest? Listed under Source
  for (let bounty of cachedBounties) {
    if (bounty.Source === data.extra.questName) {
      //Need to figure out how to quantify the actual time, use .split based on char ":" and index?
      compareTimes(data.extra.currentTime, bounty.Item[0]); // will throw error if slower
    } else {
      //Name did match
      ce("Speedrun questName");
    }
  }
};

const pk = async (data) => {};
