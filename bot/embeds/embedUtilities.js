export const getColor = (index) => {
  switch (index) {
    case 0: // Easy - Green
      return 0x229954;
    case 1: // Medium - Turquoise
      return 0x00ced1;
    case 2: // Hard - Purple
      return 0x8e44ad;
    case 3: // Elite - Yellow
      return 0xffd700;
    case 4: // Master - Red
      return 0xc0392b;
    default: // Beginner - Gray
      return 0xa4a4a4;
  }
};

export const getTier = (index) => {
  switch (index) {
    case 0:
      return "Easy";
    case 1:
      return "Medium";
    case 2:
      return "Hard";
    case 3:
      return "Elite";
    case 4:
      return "Master";
    default:
      return "Unknown Tier";
  }
};

export const getScrollImage = (index) => {
  switch (index) {
    case 0:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28easy%29_detail.png";
    case 1:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28medium%29_detail.png";
    case 2:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28hard%29_detail.png";
    case 3:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28elite%29_detail.png";
    case 4:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28master%29_detail.png";
    default:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28beginner%29_detail.png";
  }
};

export const formatBounty = (bounty) => {
  let newBounty = parseFloat(bounty);
  let newStr = "";
  if (bounty >= 1) {
    newStr = newBounty.toString() + "M";
  } else {
    newStr = (newBounty * 1000).toString() + "K";
  }
  return newStr;
};
