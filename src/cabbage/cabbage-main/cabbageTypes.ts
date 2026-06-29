export type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

export type DiscordUserResponse = {
  id: string;
  username: string;
  discriminator?: string;
  global_name?: string | null;
  avatar?: string | null;
};

export type CabbageUser = {
  discord_id: string;
  discord_username?: string;
  rsn: string;
  role: string;
};
