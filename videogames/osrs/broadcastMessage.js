import { client } from "../../bot/mainBot.js";

async function broadcastMessage(channelId, message) {
  if (!client.isReady()) {
    console.log("Client not ready yet!");
    return;
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error("Channel not found");
    await channel.send(message);
    console.log("Message sent!");
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

export { broadcastMessage };
