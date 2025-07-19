import { updateSimpleSources } from "./bountyUpdates";

const checkType = (type) => {
  if (simpleTypes.length === 0) {
    updateSimpleTypes();
  }
  if (!type || type.trim() === "") {
    return false;
  } else {
    if (simpleTypes.includes(type.trim())) {
      switch (type.trim()) {
        case "LOOT":
          console.log(`Need to implement LOOT check`);
          break;
        case "CLUE":
          console.log(`Need to implement CLUE check`);
          break;
        case "COMBAT_ACHIEVEMENT":
          console.log(`Need to implement COMBAT_ACHIEVEMENT check`);
          break;
        case "LEVEL":
          console.log(`Need to implement LEVEL check`);
          break;
        case "DEATH":
          console.log(`Need to implement DEATH check`);
          break;
        case "PET":
          console.log(`Need to implement PET check`);
          break;
        case "SPEEDRUN":
          console.log(`Need to implement SPEEDRUN check`);
          break;
        case "BARBARIAN_ASSAULT_GAMBLE":
          console.log(`Need to implement BARBARIAN_ASSAULT_GAMBLE check`);
          break;
        case "PLAYER_KILL":
          console.log(`Need to implement PLAYER_KILL check`);
          break;
        default:
          console.log(
            `Type ${type} is recognized but has no specific check implemented.`
          );
          return false;
      }
    } else {
      return false;
    }
  }
};

const checkSource = (source) => {
  if (simpleSources.length === 0) {
    updateSimpleSources();
  }
  if (!source || source.trim() === "") {
    return false;
  } else {
    if (simpleSources.includes(source.trim())) {
      return true;
    }
  }
};

const checkItem = (item) => {
  if (simpleItems.length === 0) {
    updateSimpleItems();
  }
  if (!item || item.trim() === "") {
    return false;
  } else {
    if (simpleItems.includes(item.trim())) {
      return true;
    }
  }
};
