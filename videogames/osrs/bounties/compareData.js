const compareItems = (data, bounty) => {
  for (const dItem of data.extra.items) {
    for (const bItem of bounty.Item) {
      if (dItem.name.trim().toLowerCase() === bItem.trim().toLowerCase()) {
        console.log(`Items match! ${bItem} vs ${dItem.name}`);
        return true;
      }
    }
  }
  console.log(`Loot matches? false`);
  return false;
};

// bounty.Source === '*' || Any time we would use wild card? add functionality later if needed
const compareSources = (source, bounty) => {
  if (bounty.Source.trim() === "*" || bounty.Source.trim() === "") {
    console.log(`Source was anything!`);
    return true;
  }
  if (bounty.Source.trim().toLowerCase() === source.trim().toLowerCase()) {
    console.log(`Sources match! returning true`);
    return true;
  }
  console.log(`Sources did not match, returning false`);
  return false;
};

const compareRegions = (dataRegion, bounty) => {
  console.log(`${parseInt(dataRegion)} vs ${parseInt(bounty.Source)}`);
  return parseInt(dataRegion) === parseInt(bounty.Source);
};

const compareCategories = (data, bounty) => {
  return (
    data.extra.category.trim().toLowerCase() ===
    bounty.Other.trim().toLowerCase()
  );
};

//Do a check beforehand for extra.npc === false for guaranteed not pvp?
export const loot = (data, bounty) => {
  if (data.extra.category === "PLAYER") {
    console.log("NOT NPC LOOT when checking against bounties");
    return false;
  }
  if (bounty.Other && bounty.Other.length > 0) {
    return (
      compareCategories(data, bounty) &&
      compareItems(data, bounty) &&
      compareSources(data.extra.source, bounty)
    );
  }
  return (
    compareItems(data, bounty) && compareSources(data.extra.source, bounty)
  );
};

export const ba = (data, bounty) => {
  console.log("Called compareData for BARB ASSAULT");
  if (bounty.Other === "items") {
    return compareItems(data, bounty);
  } else if (bounty.Other === "sum") {
    let sum = data.extra.items.reduce((acc, item) => {
      return acc + parseFloat(item.priceEach);
    }, 0);
    console.log(`Sum amounted to: ${sum}`);
    return sum > parseFloat(bounty.Item[0]);
  }
};

//Three types, pvp, pvm, and non-combat
export const death = (data, bounty) => {
  return compareRegions(data.extra.location.regionId, bounty);
};

//Specific item OR all items priceEach sum being < or > some value OR single item priceEach < or > some value
export const clue = (data, bounty) => {
  console.log("Called compareData for CLUE");
  if (data.extra.clueType.toLowerCase() !== bounty.Source.toLowerCase()) {
    console.log(data.extra.clueType.toLowerCase());
    console.log(bounty.Source.toLowerCase());
    console.log(`Clue tiers dont match!`);
    return false;
  }
  let sum = 0;
  switch (bounty.Other) {
    case "item":
      return compareItems(data, bounty);
    case "valueLess": // If lowest amount is not less than the wanted valueLess
      const lowestAmount = data.extra.items.reduce((acc, item) => {
        return item.priceEach < acc ? item.priceEach : acc;
      }, Infinity);
      console.log(lowestAmount);
      return lowestAmount < parseFloat(bounty.Item[0]);
    case "valueGreater":
      const greatestAmount = data.extra.items.reduce((acc, item) => {
        return item.priceEach > acc ? item.priceEach : acc;
      }, -Infinity);
      console.log(greatestAmount);
      return greatestAmount > parseFloat(bounty.Item[0]);
    case "sumLess":
      sum = data.extra.items.reduce((acc, item) => {
        return parseFloat(item.priceEach) + acc;
      }, 0);
      console.log(sum);
      return sum < parseFloat(bounty.Item[0]);
    case "sumGreater":
      sum = data.extra.items.reduce((acc, item) => {
        return parseFloat(item.priceEach) + acc;
      }, 0);
      console.log(sum);
      return sum > parseFloat(bounty.Item[0]);
    default:
      console.error(`Invalid clue type in cachedBounties ${bounty.Other}`);
      return false;
  }
};

// text.split(":") for both, array of 3 strings, parse and compare for each substr
export const speedrun = (data, bounty) => {
  console.log("Called compareData for SPEEDRUN");
  if (bounty.Source.toLowerCase() !== data.extra.questName.toLowerCase()) {
    return false;
  } else {
    const currentTime = durationToArray(data.extra.currentTime);
    console.log(`Current: ${currentTime}`);
    const timeToBeat = bounty.Other.split(":");
    if (timeToBeat.length === 2) {
      timeToBeat.unshift("00");
    }
    console.log(`Time to beat: ${timeToBeat}`);
    const combinedCurrent =
      parseInt(currentTime[0]) * 3600 +
      parseInt(currentTime[1]) * 60 +
      parseFloat(currentTime[2]);
    const combinedToBeat =
      parseInt(timeToBeat[0]) * 3600 +
      parseInt(timeToBeat[1]) * 60 +
      parseFloat(timeToBeat[2]);
    console.log("current: " + combinedCurrent);
    console.log("beat:" + combinedToBeat);
    return combinedCurrent < combinedToBeat;
  }
};

export const pk = (data, bounty) => {
  console.log("Called compareData for PK");
  let playerItems = data.extra.victimEquipment;
  let pkSum = Object.keys(playerItems).reduce((acc, item) => {
    return acc + parseInt(playerItems[item].priceEach);
  }, 0);
  console.log(`Item sum came out to ${pkSum}`);
  return pkSum > parseInt(bounty.Item[0]);
};

function durationToArray(duration) {
  const str = duration.replace(/^PT/, "");
  const match = str.match(/(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseFloat(match[3]) : 0;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = seconds.toFixed(1).padStart(4, "0");

  return [hh, mm, ss];
}
