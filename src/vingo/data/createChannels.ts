import {
  PermissionFlagsBits,
  PermissionsBitField,
  ChannelType,
} from "discord.js";
import * as cachedData from "../cachedData.ts";
import { client } from "../../bot/mainBot.js";
import { allowedUserIds } from "../../bot/discordUtilities.js";

const guildID = process.env.TEST_ENV
  ? "1254938527695634468"
  : "165749152603570176";

// Delay between channel creations (ms) to avoid hitting rate limits
const CREATE_DELAY_MS = 700;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createTeamChannels = async () => {
  try {
    if (cachedData.channelsCreated) {
      throw new Error("Teams have already been completed.");
    }
    if (!client || client === null || client.user === null) {
      throw new Error("Discord client is not initialized.");
    }
    const guild = await client.guilds.fetch(guildID);
    const teamCount = 3;
    console.log(`Creating channels for ${teamCount} teams`);

    for (let teamNumber = 1; teamNumber <= teamCount; teamNumber++) {
      const teamName = `Team-${teamNumber}`;
      console.log(`Processing ${teamName}`);

      // start with allowed users from bot utilities
      let userIds = Array.isArray(allowedUserIds)
        ? [...allowedUserIds]
        : [...allowedUserIds];

      // collect players from playersMap that belong to this team
      for (const [discordId, player] of cachedData.playersMap.entries()) {
        const pTeam = player?.team;
        if (pTeam !== teamNumber && String(pTeam) !== String(teamNumber))
          continue;
        if (discordId) userIds.push(String(discordId));
      }

      // remove duplicates and ensure valid strings
      userIds = Array.from(new Set(userIds.filter((i) => !!i)));
      console.log(`Resolved userIds for ${teamName}:`, userIds);

      const overwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        ...userIds.map((id) => ({
          id,
          type: 1,
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

      // THIS IS WHERE THE TEST GOES
      // Dry-run: list the players that would be assigned to this team
      // const teamPlayers: Array<{
      //   discordId: string;
      //   username?: string;
      //   rsn?: string;
      //   nickname?: string;
      // }> = [];
      // for (const [discordId, player] of cachedData.playersMap.entries()) {
      //   const pTeam = player?.team;
      //   if (pTeam !== teamNumber && String(pTeam) !== String(teamNumber))
      //     continue;
      //   teamPlayers.push({
      //     discordId,
      //     username: player?.username,
      //     rsn: player?.rsn,
      //     nickname: player?.nickname,
      //   });
      // }

      // console.log(
      //   `DRY-RUN: ${teamName} would have ${teamPlayers.length} player(s):`,
      // );
      // if (teamPlayers.length === 0) {
      //   console.log(` - (no players assigned to ${teamName})`);
      // } else {
      //   teamPlayers.forEach((p) =>
      //     console.log(
      //       ` - ${p.username ?? "<unknown>"} (${p.rsn ?? "no-rsn"}) [${p.discordId}]`,
      //     ),
      //   );
      // }

      // COMMENT EVERYTHING OUT BELOW THIS

      console.log(`Creating category for ${teamName}`);
      const category = await guild.channels.create({
        name: teamName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: overwrites,
      });
      await sleep(CREATE_DELAY_MS);

      console.log(`Creating text channel 'general' for ${teamName}`);
      await guild.channels.create({
        name: `general`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: overwrites,
      });
      await sleep(CREATE_DELAY_MS);

      console.log(`Creating text channel 'screenshots' for ${teamName}`);
      await guild.channels.create({
        name: `screenshots`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: overwrites,
      });
      await sleep(CREATE_DELAY_MS);

      console.log(`Creating voice channel 'team-chat' for ${teamName}`);
      await guild.channels.create({
        name: `team-chat`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: overwrites,
      });
      await sleep(CREATE_DELAY_MS);

      // cachedData.eventChannels[teamName] = category.id;
    }

    cachedData.setChannelsCreated(true);
    console.log("Successfully created team channels.");
  } catch (e) {
    throw e;
  }
};
