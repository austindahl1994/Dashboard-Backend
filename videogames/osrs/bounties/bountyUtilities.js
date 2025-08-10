const getURLImage = (wikiURL) => {
  return wikiURL.replace("#", "").replace("/w/", "/images/") + ".png";
};

const formatBounty = (bounty) => {
  let newBounty = parseFloat(bounty);
  let newStr = "";
  if (bounty >= 1) {
    newStr = newBounty.toString() + "M";
  } else {
    newStr = (newBounty * 1000).toString() + "K";
  }
  return newStr;
};

const getTier = (index) => {
  switch (index) {
    case 0:
      return "easy";
    case 1:
      return "medium";
    case 2:
      return "hard";
    case 3:
      return "elite";
    case 4:
      return "master";
    default:
      return "Unknown Tier";
  }
};

const difficultyToTier = (tier) => {
  switch (tier) {
    case "easy":
      return 0;
    case "medium":
      return 1;
    case "hard":
      return 2;
    case "elite":
      return 3;
    case "master":
      return 4;
    default:
      return 0;
  }
};

const bountyHeaders = [
  "Title",
  "Item",
  "Source",
  "Description",
  "Type",
  "Bounty",
  "Wiki_URL",
  "Other",
  "Status",
  "RSN",
  "Discord",
  "S3_URL",
];

export { getURLImage, formatBounty, getTier, difficultyToTier, bountyHeaders };

/*TASKS
Need to do the following:
1. On server start, check if there are no active bounties for each tier, need to find the first array (row of the sheet) that is not marked as completed
2. 
*/
