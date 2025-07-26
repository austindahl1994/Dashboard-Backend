import {
  cachedBounties,
  simpleTypes,
  simpleSources,
  simpleItems,
} from "../cachedData.js";

const completeBounty = () => {
  // Update cachedCounties immediately "Completed": true
  // return array indices of the cachedBounties array that will be modified
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
