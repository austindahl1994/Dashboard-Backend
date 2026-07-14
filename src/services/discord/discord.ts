import type {
  DiscordTokenResponse,
  DiscordUserResponse,
} from "@/types/index.ts";

const requiredEnv = [
  "CABBAGE_DISCORD_CLIENT_ID",
  "CABBAGE_DISCORD_SECRET_ID",
  "DISCORD_REDIRECT_URI",
] as const;

const tokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

const requireEnv = () => {
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
};

export const getDiscordUserFromCode = async (code: string) => {
  // console.log("[Discord OAuth] Starting Discord code exchange");
  requireEnv();
  // console.log("[Discord OAuth] Environment variables validated");
  // console.log(
  //   "[Discord OAuth] Using redirect_uri:",
  //   process.env.DISCORD_REDIRECT_URI,
  // );
  // console.log(
  //   "[Discord OAuth] Using client_id:",
  //   process.env.CABBAGE_DISCORD_CLIENT_ID,
  // );

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.CABBAGE_DISCORD_CLIENT_ID as string,
      client_secret: process.env.CABBAGE_DISCORD_SECRET_ID as string,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI as string,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    // console.error("[Discord OAuth] Failed to exchange Discord code", errorText);
    throw new Error(`Failed to exchange Discord code: ${errorText}`);
  }

  // console.log("[Discord OAuth] Discord code exchanged for access token");
  const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

  // console.log("[Discord OAuth] Fetching Discord user profile");
  const discordUserResponse = await fetch("https://discord.com/api/users/@me", {
    method: "GET",
    headers: {
      Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
    },
  });

  if (!discordUserResponse.ok) {
    const errorText = await discordUserResponse.text();
    // console.error("[Discord OAuth] Failed to fetch Discord user", errorText);
    throw new Error(`Failed to fetch Discord user: ${errorText}`);
  }

  // console.log("[Discord OAuth] Discord user profile fetched successfully");
  // console.log(`Data returned from discord: `);
  // console.log(await discordUserResponse.json());
  return {
    discordUser: (await discordUserResponse.json()) as DiscordUserResponse,
    tokenCookieOptions,
  };
};

export { tokenCookieOptions };
