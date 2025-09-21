import {
  addMembers,
  buyin,
  getAllMembers,
} from "../../../services/google/osrsSheets.js";
import { players, teams } from "../cachedData.js";

const headers = [
  "username",
  "nickname",
  "id",
  "paid",
  "donation",
  "time",
  "rsn",
  "team",
];

// Based on google sheets data, will create object with kv pairs of username: {memberData}
const createMemberObjects = (data) => {
  data.forEach((member, sheetIndex) => {
    const playerIndex =
      Object.keys(players).length > 0
        ? Object.keys(players).length + 2
        : sheetIndex + 2;
    const discordObj = Object.fromEntries(
      headers.map((key, index) => {
        return [key, member[index] ?? null];
      })
    ); //want a 2D array of kv pairs
    discordObj.index = playerIndex;
    players[member[0]] = discordObj;
  });
  // return memberObj
  console.log(`Cached ${Object.keys(players).length} members from sheets`);
  console.log(players);
  return;
};

//TODO: Update to check if cached members keys length is zero, if so to pull and update cached members
// Then after caching members, if any missing members, add them to both cached data as well as google sheets
export const updateUsers = async (discordMembers) => {
  try {
    const sheetsMembers = await getAllMembers();
    if (!sheetsMembers || sheetsMembers.length === 0) {
      console.log(`No sheets members found`);
      console.log(`Add all members from discord to sheets`);
      const membersToAdd = discordMembers.map((member, i) => {
        return {
          range: `members!A${i + 2}:H${i + 2}`,
          values: [
            [
              member?.user?.username || "No username",
              member.nickname || member.user.username,
              member.id,
              "NO",
              0,
            ],
          ],
        };
      });
      await addMembers(membersToAdd);
    } else {
      if (Object.keys(players).length === 0) {
        throw new Error("No cached members, please run /refresh first");
      }
      const sheetsMembersObj = {};
      const missingMembers = [];
      sheetsMembers.forEach((rowMember) => {
        sheetsMembersObj[rowMember[0]] = rowMember[1]; //Username: Nickname
      });
      discordMembers.forEach((guildMember) => {
        const guildUsername = guildMember?.user?.username || "No username";
        const guildNickname = guildMember.nickname ?? guildUsername;
        if (!sheetsMembersObj[guildUsername]) {
          console.log(
            `Member ${guildNickname} with username ${guildUsername} not found in sheets, adding them`
          );
          missingMembers.push([
            guildUsername,
            guildNickname,
            guildMember.id,
            "NO",
            0, //donation
            "", //time
            "", //rsn
            "", //team
          ]);
          console.log(players[guildUsername]);
        }
      });
      if (missingMembers.length > 0) {
        console.log(
          `Adding ${missingMembers.length} missing members to sheets`
        );
        console.table(missingMembers);
        createMemberObjects(missingMembers);
        const dataToWrite = missingMembers.map((member) => {
          return {
            range: `members!A${players[member[0]].index}:H${
              players[member[0]].index
            }`,
            values: [member],
          };
        });
        await addMembers(dataToWrite);
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

//TODO: Update using cached users data, updates cached data and user in google sheets
export const memberMoney = async (memberObj) => {
  try {
    const { username, nickname, id, donation, intendedHours, rsn } = memberObj;
    if (!username || !id || !nickname) {
      throw new Error("Missing required member information");
    }
    if (players[username]) {
      console.log(`Player exists in cached members:`);
      console.log(players[username]);
      const playerData = [
        username,
        nickname,
        id,
        "YES",
        donation,
        intendedHours,
        rsn,
      ];
      players[username].paid = "YES";
      players[username].donation = donation || 0;
      players[username].time = intendedHours || 0;
      players[username].rsn = rsn || "";
      console.log(`Updating player data for ${username}: `);
      console.log(playerData);
      const sheetIndex = players[username].index;
      const sheetRange = `members!A${sheetIndex}:G${sheetIndex}`;
      console.log(playerData + "" + sheetRange);
      await buyin({ playerData, sheetRange });
    } else {
      throw new Error(`User ${username} not found in sheets`);
    }
  } catch (error) {
    throw error;
  }
};

export const paidMembers = () => {
  try {
    const paid = Object.values(players)
      .filter((member) => member.paid === "YES")
      .sort((a, b) => b.donation - a.donation);
    console.log(`There are currently ${paid.length} paid members: `);
    console.table(
      paid.map((member) => {
        return [member.nickname, member.donation, member.time];
      })
    );

    console.log(
      `Total GP: ${
        paid.length * 11 +
        paid.reduce((acc, member) => acc + (parseInt(member.donation) || 0), 0)
      }`
    );
    const finalPaid = paid.sort((a, b) => {
      if (Number(a.donation) === 0 && Number(b.donation) === 0) {
        return Number(b.time) - Number(a.time);
      }
    });
    console.table(finalPaid, ["rsn", "time", "donation", "index"]);
    return finalPaid;
  } catch (error) {
    console.log(`Error with paid members: ${error}`);
    throw error;
  }
};

//TODO: after team names decided, add channels to discord based on team name, add mods to it, add players on those teams to them
//Should only call this once after testing, will add team names to players based on play time
export const createGroups = async () => {
  try {
    const paidMembers = Object.keys(players)
      .filter((username) => players[username].paid !== "YES")
      .sort((a, b) => {
        return players[a].time - players[b].time;
      });
    if (!paidMembers || paidMembers.length === 0) {
      throw new Error("No members have paid yet, cannot create any groups!");
    }
    const amountOfTeams = Math.ceil(paidMembers.length / 5);
    const allTeams = Array.from({ length: amountOfTeams }).map(() => []);
    paidMembers.forEach((username, index) => {
      const teamName = `Team - ${index % amountOfTeams}`;
      allTeams[index % amountOfTeams].push(username);
      if (players[username].team === "") {
        players[username].team = teamName;
      }
      if (teams[teamName]) {
        teams[teamName].push(username);
      } else {
        teams[teamName] = [username];
      }
    });
    console.log("Teams created! Teams are as follows: ");
    console.table(teams);
    await teamsToSheets();
  } catch (error) {
    console.log(`Error creating group: ${error} `);
    throw error;
  }
};

const teamsToSheets = async () => {
  try {
    const allTeams = Object.keys(teams);
    const dataToWrite = allTeams.flatMap((teamName, teamIndex) => {
      return teams[teamName].map((username) => {
        return {
          range: `members!H${players[username].index}`,
          values: [[players[username].team]],
        };
      });
    });
    await writeSheetsGroups(dataToWrite);
  } catch (error) {
    throw error;
  }
};
/* Example for copying object data from one key to new one
if (peopleData[oldName]) {
  peopleData[newName] = peopleData[oldName];
  delete peopleData[oldName];
}
*/
// TODO: Update this based on teams being an object
export const updateTeamName = async (prevName, newName) => {
  try {
    const teamPlayers = teams[newName];
    const finalData = [];
    teamPlayers.forEach((username) => {
      const player = players[username];
      if (!player) {
        throw new Error(`Player ${rsn} was not found in cached players`);
      }
      player.team = newName;
      finalData.push({
        range: `members!H${player.index}`,
        values: [[newName]],
      });
    });
    console.log(finalData);
    // delete teams[prevName]
  } catch (error) {
    throw error;
  }
};

// TODO look at the above code, see what is necessary still after having the member data cached
//Array of arrays, each array is a row
export const updateCachedMembers = (data) => {
  try {
    if (!data || data.length === 0) {
      throw new Error("No member data to cache");
    }
    createMemberObjects(data);
  } catch (e) {
    throw e;
  }
};
