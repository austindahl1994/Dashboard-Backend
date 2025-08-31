import {
  addMembers,
  buyin,
  getAllMembers,
} from "../../../services/google/osrsSheets.js";

const headers = ["username", "nickname", "id", "paid", "donation", "playtime", "rsn", "team"]

// Based on google sheets data, will create object with kv pairs of username: {memberData}
const createMemberObjects = (data) => {
  const memberObj = {}
  data.forEach((member, sheetIndex) => {
    const username = member[0]
    const discordObj = Object.fromEntries(member.slice(1).map((key, index) => {
      return [key, member[index]]
    })) //want a 2D array of kv pairs
    discordObj.sheetIndex = sheetIndex + 2
    memberObj[username] = discordObj
  })
  return memberObj
}

export const updateUsers = async (discordMembers) => {
  try {
    const sheetsMembers = await getAllMembers();
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
        sheetsMembersObj[rowMember[0]] = rowMember[1]; //Username: Nickname
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
    const { nickname, username, id, donation, intendedHours, rsn } = memberObj;
    const sheetsMembers = await getAllMembers();
    const sheetsMembersObj = {};
    sheetsMembers.forEach((rowMember, index) => {
      sheetsMembersObj[rowMember[0]] = {
        nickname: rowMember[1],
        index: index + 2,
      };
    });
    if (sheetsMembersObj[username]) {
      const index = sheetsMembersObj[username].index;
      const sheetData = [username, nickname, id, "YES", donation, intendedHours, rsn];
      const sheetRange = `members!A${index}:G${index}`;
      await buyin({ sheetData, sheetRange });
    } else {
      throw new Error(`User ${username} not found in sheets`);
    }
  } catch (error) {
    throw error;
  }
};

export const createGroups = async () => {
  try {
    const sheetsMembers = await getAllMembers();
    if (!sheetsMembers || sheetsMembers.length === 0) {
      throw new Error('No members currently in sheets document')
    }
    const teams = {}
    sheetMembers.forEach((member) => {
      // There aren't 6 cols for that member row, meaning they haven't paid buy in/joined team yet
      if (member.length !== 6) {
        return
      } else {
        
      }
    })
  } catch (error) {
    console.log(`Error creating group: ${error} `)
    throw error
  }
}

//Cronjob will call this once every 24 hours
export const submitPlaytime = async (arrOfPlayerObj) => {
  try {
    const members = await getAllMembers();
    
  } catch (error) {
    
  }
} 
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
