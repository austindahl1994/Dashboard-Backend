import {
  cachedBounties,
  simpleTypes,
  simpleSources,
  simpleItems,
} from "../cachedData.js";

const completeBounty = () => {
  // Logic for completing a bounty
  // Update cachedCounties immediately "Completed": true
  // Save image to S3 and get new S3_URL, null the image locally
  // Create new data object with: Player_Name, S3_URL, Quantity, then save to cachedSheets based on Sheet_Index
  // Update cachedSheets for a new task based on previous Sheet_Index and tier, if none then set Tier_completed to true
  // Update Google sheet with data object and setting the next "Open" bounty to "Active" to match cachedSheets
};

const updateAllSimpleData = () => {
  updateSimpleSources();
  updateSimpleItems();
  updateSimpleTypes();
  console.log(`Finished updating simple data arrays:`);
  console.log(`Types: `, simpleTypes);
  console.log(`Sources: `, simpleSources);
  console.log(`Items: `, simpleItems);
};

const updateSimpleTypes = () => {
  const typeSet = new Set();
  cachedBounties.forEach(({ Type }) => {
    if (typeof Type === "string" && Type.trim() !== "") {
      typeSet.add(Type.trim());
    }
  });
  simpleTypes.length = 0;
  simpleTypes.push(...typeSet);
};

const updateSimpleSources = () => {
  const sourceSet = new Set();
  cachedBounties.forEach(({ Source }) => {
    if (typeof Source === "string" && Source.trim() !== "") {
      sourceSet.add(Source.trim());
    }
  });
  simpleSources.length = 0;
  simpleSources.push(...sourceSet);
};

const updateSimpleItems = () => {
  const itemSet = new Set();
  cachedBounties.forEach(({ Item }) => {
    if (!Item) return;
    if (Array.isArray(Item)) {
      Item.forEach((i) => {
        if (typeof i === "string" && i.trim() !== "") {
          itemSet.add(i.trim());
        }
      });
    } else if (typeof Item === "string" && Item.trim() !== "") {
      itemSet.add(Item.trim());
    }
  });
  simpleItems.length = 0;
  simpleItems.push(...itemSet);
};

export {
  updateAllSimpleData,
  updateSimpleItems,
  updateSimpleSources,
  updateSimpleTypes,
};
