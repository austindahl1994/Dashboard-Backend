import { EmbedBuilder } from "discord.js";

export const gpEmbed = (players) => {
  const paidMembers = players.map((p) => {
    return `RSN: ${p.rsn} Donation: ${p.donation} Time: ${p.time} Discord: ${p.nickname}`
  }).join("\n")
  
  const buyinGP = players.length * 11
  const donationGP = players.reduce((p, acc) => (parseInt(p.donation) || 0) + acc, 0)
  const totalGP = buyinGP + donationGP
  
  const embed = new EmbedBuilder()
    .setTitle(`__Paid members__`)
    .addFields({
      name: "__Players__",
      value: paidMembers,
      inline: true,
    })
    .addFields({
      name: "__Total GP__",
      value: `Buyins: ${buyinGP} Donations: ${donationGP} Total: ${totalGP}`,
      inline: false
    })
  return [embed];
};
