import {
  cachedBounties
} from "../cachedData.js";

const compareItems = (data, bounty) => {
  for (let item of data.extra.items) {
    if (bounty.Item.includes(item)) {
      return true
    }
  }
  return false
};

// bounty.Source === '*' || Any time we would use wild card? add functionality later if needed
const compareSources = (data, bounty) => { 
  if (bounty.Source === data.extra.source) {
    return true
  } 
  return false
};

const compareRegions = (data, bounty) => {
  if (data.regionId && data.regionId === bounty.Region) {
    return true
  }
  return false
};

const increaseQuantity = (bounty) => {
  bounty.Quantity += 1
}

//Do a check beforehand for extra.npc === false for guaranteed not pvp?
export const loot = async (data, bounty) => {
  if (data.extra.category !== "NPC") {
    console.log("NOT NPC LOOT when checking against bounties")
  }
  if (compareSource(data, bounty)) {
    increaseQantity(bounty)
    if (compareItems(data, bounty)) {
      return true
    }
  }
  return false
};

export const ba = async (data, bounty) => {
  increaseQuantity(bounty)
  return compareItems(data, bounty)
};

//Three types, pvp, pvm, and non-combat
export const death = async (data, bounty) => {
    //Death against player
  if (data.extra.isPvp === true) {
    return false
    //Death against NPC
  } else if (data.content.killerName && bounty.Other === "npc") {
    increaseQantity(bounty)
    return (compareSources(data, bounty))
    //Death against non-combat, do we only care about this field?
  } else if (!data.extra.killerName && bounty.Other === "seek") {
    increaseQantity(bounty)
    return (compareRegions(data, bounty))
  } else {
    return false
  }
};

//Specific item OR all items priceEach sum being < or > some value OR single item priceEach < or > some value
export const clue = async (data, bounty) => {
  if (data.extra.clueType.toLowerCase() === bounty.Source.toLowerCase()) {
    increaseQuantity(bounty)
  } else {
    return false
  }
  let sum = 0;
  switch (bounty.Other) {
    case "item":
      return compareItems(data);
      break;
    case "valueLess": // If lowest amount is not less than the wanted valueLess
      const lowestAmount = data.extra.items.reduce((acc, item) => {
        return item.priceEach < acc ? item.priceEach : acc;
      }, Infinity);
      return lowestAmount < parseFloat(bounty.Item[0])
      break;
    case "valueGreater":
      const greatestAmount = data.extra.items.reduce((acc, item) => {
        return item.priceEach > acc ? item.priceEach : acc;
      }, -Infinity);
      return geatestAmount > parseFloat(bounty.Item[0])
      break;
    case "sumLess":
      sum = data.extra.items.reduce((acc, item) => {
        return parseFloat(item.priceEach) + acc;
      }, 0);
      return sumLess < parseFloat(bounty.Item[0])
      break;
    case "sumGreater":
      sum = data.extra.items.reduce((acc, item) => {
        return parseFloat(item.priceEach) + acc;
      }, 0);
      return sum > parseFloat(bounty.Item[0]) 
      break;
    default:
      console.error(`Invalid clue type in cachedBounties ${bounty.Other}`);
      return false
      break;
  }
};

export const pet = async (data) => {
  //call get pet list, either increment count + 1 if exists under same discord/playername or create new + 1
};

//NEED TO UPDATE TO RETURN TRUE/FALSE
// Time listed under Item[0], questName under Source
// text.split(":") for both, array of 3 strings, parse and compare for each of them?
export const speedrun = async (data) => {
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

export const pk = async (data) => {};
