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
    const playerIndex = Object.keys(players).length > 0 ? Object.keys(players).length + 2 : sheetIndex + 2;
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
  // console.log(players);
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
          values: [[
            member?.user?.username || "No username",
            member.nickname || member.user.username,
            member.id,
            "NO",
            0,
          ]]
        }
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
            "" //team
          ]);
          console.log(players[guildUsername]);
        }
      });
      if (missingMembers.length > 0) {
        console.log(
          `Adding ${missingMembers.length} missing members to sheets`
        );
        console.table(missingMembers);
        createMemberObjects(missingMembers)
        const dataToWrite = missingMembers.map((member) => {
          return {
            range: `members!A${players[member[0]].index}:H${players[member[0]].index}`,
            values: [[member]]
          }
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
      await buyin({ playerData, sheetRange });
    } else {
      throw new Error(`User ${username} not found in sheets`);
    }
  } catch (error) {
    throw error;
  }
};

export const paidMembers = () => {
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
  return paid
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
      const teamName = `Team - ${index % amountOfTeams}`
      allTeams[index % amountOfTeams].push(username);
      if (players[username].team === "") {
        players[username].team = teamName
      }
      if (teams[teamName]) {
        teams[teamName].push(username)
      } else {
        teams[teamName] = [username]
      }
    });
    console.log("Teams created! Teams are as follows: ")
    console.table(teams)
    await teamsToSheets()
  } catch (error) {
    console.log(`Error creating group: ${error} `);
    throw error;
  }
};

const teamsToSheets = async () => {
  try {
    const allTeams = Object.keys(teams)
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
export const updateTeamName = async (prevTeamName, newTeamName) => {
  try {
    const teamIndex = teamNames.indexOf(prevTeamName);
    if (teamIndex === -1) {
      throw new Error("No team for specified name");
    }
    teamNames[teamIndex] = newTeamName;
    const data = await getSpecificMemberData(["members!H2:H400"]);
    const teamIndices = data[0].map((teamName, sheetIndex) => {
      return teamName?.trim() === prevTeamName?.trim() ? sheetIndex + 2 : null;
    });
    const dataToWrite = teamIndices.map((n) => {
      return {
        range: `members!H${n}`,
        value: [[newTeamName]],
      };
    });
    console.log(dataToWrite);
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
// Balancing groups, sort each member by playtime, then add members in one at a time to each group
// Discord group channel creations
/*
const { PermissionFlagsBits, ChannelType } = require('discord.js');

// Your data
const events = ['match-1', 'match-2', 'match-3', 'match-4', 'match-5'];
const EVENT_MOD_IDS = ['123456789012345678', '234567890123456789']; // Mod user or role IDs

// Map of usernames per event
const USERNAMES_BY_EVENT = {
  'match-1': ['PlayerOne#1111', 'PlayerTwo#2222'],
  'match-2': ['PlayerThree#3333', 'PlayerFour#4444'],
  'match-3': ['PlayerFive#5555'],
  'match-4': ['PlayerSix#6666'],
  'match-5': ['PlayerSeven#7777'],
};

// Inside an async function or event handler
for (const eventName of events) {
  const allowedUsernames = USERNAMES_BY_EVENT[eventName] || [];
  const userIds = [];

  // Fetch and resolve usernames to IDs
  for (const tag of allowedUsernames) {
    const member = await guild.members.fetch({ query: tag.split('#')[0], limit: 10 });

    // Match full tag
    const user = member.find(m => m.user.tag === tag);
    if (user) userIds.push(user.id);
    else console.warn(`User not found: ${tag}`);
  }

  // Build permission overwrites
  const overwrites = [
    {
      id: guild.roles.everyone,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    ...EVENT_MOD_IDS.map(id => ({
      id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    })),
    ...userIds.map(id => ({
      id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    })),
    {
      id: client.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
    },
  ];

  // Create the private channel
  await guild.channels.create({
    name: eventName,
    type: ChannelType.GuildText, //https://discord-api-types.dev/api/discord-api-types-v10/enum/ChannelType
    permissionOverwrites: overwrites,
  });

  console.log(`Created channel: ${eventName}`);
}
*/
