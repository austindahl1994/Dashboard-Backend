import { addMembers } from "../../../services/google/osrsSheets.js";

// Compare data of sheets vs guild members
export const updateUsers = async (discordMembers, sheetsMembers) => {
  try {
    //const nickname = discordMembers.nickname ?? discordMembers.user.username; nickname/username
    if (!sheetsMembers || sheetsMembers.length === 0) {
      console.log(`No sheets members found`);
      console.log(`Add all members from discord to sheets`);
      const membersToAdd = discordMembers.map((member) => {
        const nickname = member.nickname ?? member.user.username;
        return [nickname, member?.user?.username || "No username", "NO", 0]; //Name, Username, Paid, Donation Amount
      });
      console.table(membersToAdd);
      await addMembers(membersToAdd);
    } else {
      console.log(`There are ${sheetsMembers.length} members in sheets`);
      console.log(sheetsMembers);
      //Need to compare the two lists, if discord member not in sheets, add them
      //return sorted version based on donation
    }
  } catch (error) {
    console.log(`Error updating users: `);
    console.log(error);
    throw error;
  }
};
