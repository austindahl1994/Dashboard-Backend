import { EmbedBuilder } from "discord.js";

export const gpEmbed = (paidPlayersArr) => {
  try {
    // console.log(`Passed in Data for gp: `);
    // console.table(paidPlayersArr, ["rsn", "donation", "time"]);

    // Build one big string of all members
    const paidMembers = paidPlayersArr
      .map(
        (p) =>
          `__${p.rsn}__ **${p.time}** Hrs ${
            Number(p.donation) !== 0 ? `**DONO: **` + p.donation : ``
          }\n`
      )
      .join("\n");

    // Split into chunks of <= 1024 characters (Discord field limit)
    const fields = [];
    let buffer = "";

    for (const line of paidMembers.split("\n")) {
      if (buffer.length + line.length + 1 > 1024) {
        fields.push({ name: "__Players__", value: buffer, inline: true });
        buffer = "";
      }
      buffer += (buffer ? "\n" : "") + line;
    }
    if (buffer) {
      fields.push({ name: "__Players__", value: buffer, inline: true });
    }

    // GP calculations
    const buyinGP = paidPlayersArr.length * 11;
    const donationGP = paidPlayersArr.reduce(
      (acc, p) => acc + (parseInt(p.donation) || 0),
      0
    );
    const totalGP = buyinGP + donationGP;

    // Build embed
    const embed = new EmbedBuilder()
      .setTitle(`__Paid members__`)
      .addFields(...fields) // add chunked fields
      .addFields({
        name: "__Total GP__",
        value: `Players ${paidPlayersArr.length}, Buyins: ${buyinGP}M, Donations: ${donationGP}M, Total: ${totalGP}M (Wash/Pubes intend to dono too)`,
        inline: false,
      });

    return embed;
  } catch (error) {
    console.log(`Error creating GP embed: ${error}`);
    throw error;
  }
};
