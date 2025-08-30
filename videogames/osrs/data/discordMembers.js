import {
  addMembers,
  buyin,
  getAllMembers,
} from "../../../services/google/osrsSheets.js";

export const updateUsers = async (discordMembers, sheetsMembers) => {
  try {
    if (!sheetsMembers || sheetsMembers.length === 0) {
      console.log(`No sheets members found`);
      console.log(`Add all members from discord to sheets`);
      const membersToAdd = discordMembers.map((member) => {
        const nickname = member.nickname ?? member.user.username;
        return [nickname, member?.user?.username || "No username", member.id, "NO", 0];
      });
      console.table(membersToAdd);
      await addMembers(membersToAdd);
    } else {
      const sheetsMembersObj = {};
      const missingMembers = [];
      sheetsMembers.forEach((rowMember) => {
        sheetsMembersObj[rowMember[1]] = rowMember[0]; //Username: Nickname
      });
      discordMembers.forEach((guildMember) => {
        const guildUsername = guildMember?.user?.username || "No username";
        const guildNickname = guildMember.nickname ?? guildUsername;
        if (!sheetsMembersObj[guildUsername]) {
          console.log(
            `Member ${guildNickname} with username ${guildUsername} not found in sheets, adding them`
          );
          missingMembers.push([guildNickname, guildUsername, guildMember.id, "NO", 0]);
        }
      });
      if (missingMembers.length > 0) {
        console.log(
          `Adding ${missingMembers.length} missing members to sheets`
        );
        console.table(missingMembers);
        missingMembers.forEach((member) => {
          sheetsMembers.push(member);
        });
        await addMembers(sheetsMembers);
      } else {
        console.log(`No missing members to add to sheets`);
      }
    }
  } catch (error) {
    console.log(`Error updating users: `);
    console.log(error);
    throw error;
  }
};

export const memberMoney = async (memberObj) => {
  try {
    const { nickname, username, id, donation } = memberObj;
    const sheetsMembers = await getAllMembers();
    const sheetsMembersObj = {};
    sheetsMembers.forEach((rowMember, index) => {
      sheetsMembersObj[rowMember[1]] = {
        nickname: rowMember[0],
        index: index + 2,
      };
    });
    if (sheetsMembersObj[username]) {
      const index = sheetsMembersObj[username].index;
      const sheetData = [nickname, username, id, "YES", donation];
      const sheetRange = `members!A${index}:D${index}`;
      await buyin({ sheetData, sheetRange });
    } else {
      throw new Error(`User ${username} not found in sheets`);
    }
  } catch (error) {
    throw error;
  }
};
