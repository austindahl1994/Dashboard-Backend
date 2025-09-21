import {
  PermissionFlagsBits,
  PermissionsBitField,
  ChannelType,
} from "discord.js";
import {
  players,
  teams,
  channelsCreated,
  eventChannels,
} from "../cachedData.js";
import { allowedUserIds } from "../../../bot/utilities/discordUtils.js";

export const createTeamChannels = async (guild, client) => {
  try {
    if (channelsCreated) {
      throw new Error("Teams have already been completed.");
    }
    // if (Object.keys(players).length === 0 || Object.keys(teams).length === 0) {
    //   throw new Error(
    //     "There are either no players or teams currently cached, try using /refresh"
    //   );
    // }
    let teamNames = Object.keys(teams);
    if (teamNames.length === 0) {
      console.log(`No teams found in cache.`);
      if (Object.keys(players).length === 0) {
        throw new Error("No players found in cache.");
      }
      console.log(`Creating teams from players...`);

      Object.values(players).forEach((player) => {
        const pTeam = player.team;
        if (!pTeam) return; // skip players without a team

        const teamKey = `team_${pTeam}`;
        if (teams[teamKey]) {
          teams[teamKey].push(player.username);
        } else {
          teams[teamKey] = [player.username];
        }
      });
      teamNames = Object.keys(teams);
    }

    console.log(`Creating channels for teams: ${teamNames.join(", ")}`);
    console.log(`Player count: ${Object.keys(players).length}`);
    console.log(`All teams: `);
    Object.keys(teams).forEach((t) => {
      teams[t].map((user) => {
        console.log(` - ${t}: ${players[user].rsn} - ${user}`);
      });
    });
    //create team channels based on teams and players
    for (const t of teamNames) {
      console.log(`Processing team: ${t}`);
      let userIds = [...allowedUserIds];

      // Use key of teamName in teams to get array of players on team, add each to userIds
      teams[t].forEach((username) => {
        const p = players[username];
        if (p && p.id) {
          console.log(`Adding player to channel: ${p.rsn} - ${p.id}`);
          userIds.push(p.id);
        }
      });
      console.log("Resolved userIds:", userIds);

      const overwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        ...userIds.map((id) => ({
          id, // string snowflake is fine
          type: 1, // 1 = member, 0 = role
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.Speak,
          ],
        })),
        {
          id: client.user.id,
          type: 1,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.Speak,
            PermissionsBitField.Flags.ManageChannels,
          ],
        },
      ];

      console.log(`Creating channels for team: ${t}`);
      console.log(`overwrites: `);
      console.table(overwrites, ["id", "allow", "deny"]);
      // Create category channel

      const category = await guild.channels.create({
        name: t,
        type: ChannelType.GuildCategory,
        permissionOverwrites: overwrites,
      });

      // Create text channel under category
      const text = await guild.channels.create({
        name: `chat`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: overwrites,
      });

      // Create voice channel under category
      const voice = await guild.channels.create({
        name: `voice`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: overwrites,
      });

      eventChannels[t] = category.id;
    }
    channelsCreated = true;
  } catch (e) {
    throw e;
  }
};

// export const updateChannelName = async (guild, newName, prevName) => {
//   try {
//     if (!eventChannels[prevName]) {
//       throw new Error(`Team name does not exist in eventChannels, use /refresh to update channel IDs`)
//     }

//     const id =  eventChannels[prevName]
//     const channel = await guild.channels.fetch(id)

//     if (channel.type !== ChannelType.GuildCategory) {
//       throw new Error(`Channel is not a category — ID: ${id}`);
//     }

//     const safeName = newName.trim().toLowerCase().replace(/\s+/g, '-')
//     await channel.edit({name: safeName})
//     eventChannels[newName] = eventChannels[prevName]
//     delete eventChannels[prevName]
//     console.log(`Renamed category ${prevName} → ${newName}`);
//   } catch (e) {
//     throw e
//   }
// }

//   export const removeTeamChannels = async (guild, teamName) => {
//      try {
//       if (teamName !== "all") {
//         const categoryId = eventChannels[teamName];
//         deleteChannelsFromCategory(guild, categoryId)
//       } else {
//         const allCategories = Object.values(eventChannels)
//         for (const id of allCategories) {
//           deleteChannelsFromCategory(guild, id)
//         }
//       }
//     } catch (err) {
//       console.error(`Error deleting channels for ${teamName === "all" ? "ALL teams" : teamName}:`, err);
//       throw err;
//     }
//   }

// const deleteChannelsFromCategory = async (guild, categoryId) => {
//   try {
//     if (!categoryId) throw new Error(`No category ID found for team "${teamName}".`);
//       const category = await guild.channels.fetch(categoryId);
//         if (!category || category.type !== ChannelType.GuildCategory) {
//           throw new Error(`Channel ID ${categoryId} is not a valid category.`);
//         }

//         // Fetch all channels in the guild (or cache them depending on intent)
//         const children = guild.channels.cache.filter(ch => ch.parentId === categoryId);

//         // Delete child channels first
//         for (const child of children.values()) {
//           await child.delete(`Cleaning up team ${teamName}`);
//         }

//         // Delete the category itself
//         await category.delete(`Cleaning up team ${teamName} category`);

//         // Clean up your eventChannels map
//         delete eventChannels[teamName];

//         console.log(`Deleted all channels for team "${teamName}".`);
//   } catch (e) {
//     throw e
//   }
// }
// // Discord group channel creations
// /*
// const { PermissionFlagsBits, ChannelType } = require('discord.js');

// // Your data
// const events = ['match-1', 'match-2', 'match-3', 'match-4', 'match-5'];
// const EVENT_MOD_IDS = ['123456789012345678', '234567890123456789']; // Mod user or role IDs

// // Map of usernames per event
// const USERNAMES_BY_EVENT = {
//   'match-1': ['PlayerOne#1111', 'PlayerTwo#2222'],
//   'match-2': ['PlayerThree#3333', 'PlayerFour#4444'],
//   'match-3': ['PlayerFive#5555'],
//   'match-4': ['PlayerSix#6666'],
//   'match-5': ['PlayerSeven#7777'],
// };

// // Inside an async function or event handler
// for (const eventName of events) {
//   const allowedUsernames = USERNAMES_BY_EVENT[eventName] || [];
//   const userIds = [];

//   // Fetch and resolve usernames to IDs
//   for (const tag of allowedUsernames) {
//     const member = await guild.members.fetch({ query: tag.split('#')[0], limit: 10 });

//     // Match full tag
//     const user = member.find(m => m.user.tag === tag);
//     if (user) userIds.push(user.id);
//     else console.warn(`User not found: ${tag}`);
//   }

//   // Build permission overwrites
//   const overwrites = [
//     {
//       id: guild.roles.everyone,
//       deny: [PermissionFlagsBits.ViewChannel],
//     },
//     ...EVENT_MOD_IDS.map(id => ({
//       id,
//       allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
//     })),
//     ...userIds.map(id => ({
//       id,
//       allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
//     })),
//     {
//       id: client.user.id,
//       allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
//     },
//   ];

//   // Create the private channel
//   await guild.channels.create({
//     name: eventName,
//     type: ChannelType.GuildText, //https://discord-api-types.dev/api/discord-api-types-v10/enum/ChannelType
//     permissionOverwrites: overwrites,
//   });

//   console.log(`Created channel: ${eventName}`);
// }
// */
