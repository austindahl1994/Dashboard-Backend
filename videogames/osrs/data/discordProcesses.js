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
