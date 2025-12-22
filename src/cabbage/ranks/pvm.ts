import { Activity, Details, RankEmbed } from "./rankTypes.ts";

interface RaidKC {
  header: string;
  totalKC: number;
  individualKC: number[];
  hardModeKC: number[];
  details: string[];
  allRaidKC: number[];
}

interface SlayerBossKC {
  header: string;
  totalKC: number;
  details: string[];
}

export const calcPVM = (
  firecape: boolean,
  infernalQuiver: boolean,
  caTier: string,
  allActivities: Activity[]
) => {
  try {
    const slayerBossKC: SlayerBossKC = calcSlayerBossKC(allActivities);
    const raidsKC: RaidKC = calcRaidsKC(allActivities);
    return calcFinalPvmRank(
      firecape,
      infernalQuiver,
      caTier,
      slayerBossKC,
      raidsKC
    );
  } catch (error) {
    throw error;
  }
};

const calcSlayerBossKC = (activities: Activity[]): SlayerBossKC => {
  const details: string[] = [];
  const totalKC = activities.reduce((acc, value) => {
    if (slayerBosses.includes(value.name)) {
      const finalValue: number = value.score > 0 ? value.score : 0;
      const name =
        value.name === "Thermonuclear Smoke Devil" ? "Thermy" : value.name;
      details.push(`${name}: ${finalValue}`);
      return acc + finalValue;
    } else {
      return acc;
    }
  }, 0);
  details.push(`**__Total: ${totalKC}__**`);
  return { header: "Slayer Bosses", totalKC, details };
};

const calcRaidsKC = (activities: Activity[]): RaidKC => {
  let totalKC = 0; //used for checking total raid KC, includers reg and hard mode
  const hardModeKC: number[] = [];
  const details: string[] = [];
  const individualKC: number[] = [];
  const allRaidKC: number[] = [0, 0, 0];
  const raidsList = Array.from({ length: raids.length }).flatMap(
    (raid, index) => {
      return [raids[index], hardModeRaids[index]];
    }
  );
  activities.forEach((activity) => {
    if (raids.includes(activity.name)) {
      const raidIndex = raids.indexOf(activity.name);
      const quickRaidIndex = raidsList.indexOf(activity.name); //Use this for shorter names
      individualKC[raidIndex] = Number(activity.score > 0 ? activity.score : 0);
      details.push(
        `${quickRaids[quickRaidIndex]}: ${
          activity.score > 0 ? activity.score : 0
        }`
      );
    } else if (hardModeRaids.includes(activity.name)) {
      const raidIndex = hardModeRaids.indexOf(activity.name);
      const quickRaidIndex = raidsList.indexOf(activity.name);
      hardModeKC[raidIndex] = Number(activity.score > 0 ? activity.score : 0);
      details.push(
        `${quickRaids[quickRaidIndex]}: ${
          activity.score > 0 ? activity.score : 0
        }`
      );
    }
    if (raidsList.includes(activity.name)) {
      // console.log(`Raids list includes the raid, should add to total`);
      totalKC += activity.score > 0 ? activity.score : 0;
      const raidIndex = Math.floor(raidsList.indexOf(activity.name) / 2);
      allRaidKC[raidIndex] =
        allRaidKC[raidIndex] + Number(activity.score > 0 ? activity.score : 0);
      // console.log(`All raid KC after addition: ${allRaidKC}`);
    }
  });

  const raidTotal = allRaidKC.reduce((acc, val) => acc + val, 0);
  details.push(`**__Total: ${raidTotal}__**`);

  return {
    header: "Raids",
    totalKC,
    individualKC: individualKC,
    hardModeKC: hardModeKC,
    details,
    allRaidKC,
  };
};

const calcFinalPvmRank = (
  firecape: boolean,
  infernalQuiver: boolean,
  caTier: string,
  slayKC: SlayerBossKC,
  raidKC: RaidKC
): RankEmbed => {
  // iterate through ranks, checking if requirements are met
  const tiers: any = [
    firecape,
    slayKC,
    raidKC,
    caTier,
    raidKC,
    infernalQuiver,
    caTier,
    caTier,
  ];
  const title = "PvM Path";
  const rankDetails: Details = { header: "Ranks", fields: [] };
  let highestRank = 0;
  let hitWall: boolean = false;
  ranks.forEach((rank, index) => {
    const meetsReq = checkRank(rank, tiers[index]);
    const icon = meetsReq ? "✅" : "❌";
    rankDetails.fields.push(`${icon} ${ranksList[index]}`);
    if (meetsReq && !hitWall) {
      highestRank = index;
    } else {
      hitWall = true;
    }
  });
  const rank = ranks[highestRank];
  // console.log(`Highest rank: ${ranks[highestRank]} for index ${highestRank}`);
  const description = `**${rank.toUpperCase()}** rank achieved in PvM!`;
  const raidDetails: Details = {
    header: raidKC.header,
    fields: raidKC.details,
  };
  const slayerDetails: Details = {
    header: slayKC.header,
    fields: slayKC.details,
  };
  const details: Details[] = [rankDetails, slayerDetails, raidDetails];
  return { title, description, details, rank, rankIndex: highestRank + 1 };
};

const checkRank = (
  rankString: string,
  value: boolean | number | string | RaidKC | SlayerBossKC
) => {
  try {
    // Just return T/F or also return the string/ with checkmark or X?
    switch (rankString) {
      case "Brassican":
        return true;
      case "Protector":
        return value === true;
      case "Bulwark":
        return (value as SlayerBossKC).totalKC >= 1000;
      case "Justicar":
        return (value as RaidKC).totalKC >= 50;
      case "Sentry":
        return (
          value === "elite" || value === "master" || value === "grandmaster"
        );
      case "Guardian":
        const raidsCheck = value as RaidKC;
        // console.log(`Total raids kc: ${raidsCheck.allRaidKC}`);
        return (
          raidsCheck.allRaidKC.every((kc) => Number(kc) >= 100) &&
          raidsCheck.hardModeKC.every((kc) => Number(kc) >= 10)
        );
      case "Warden":
        return value === true;
      case "Vanguard":
        return value === "master" || value === "grandmaster";
      case "Templar":
        return value === "grandmaster";
      default:
        return false;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/*
---------------------------
PVM
---------------------------
Protector: fire cape
Bulwark: 1000 slayer boss kc
Justicar: 50 raids kc
Sentry: Elite CAs
Guardian: 100 kc in each raid + 10 in hard variants
Warden: infernal cape or quiver
Vanguard: master CAs
Templar: Grandmaster CAs
*/

const ranks = [
  "Protector",
  "Bulwark",
  "Justicar",
  "Sentry",
  "Guardian",
  "Warden",
  "Vanguard",
  "Templar",
];

const slayerBosses = [
  "Abyssal Sire",
  "Alchemical Hydra",
  "Araxxor",
  "Cerberus",
  "Grotesque Guardians",
  "Kraken",
  "Shellbane Gryphon",
  "Thermonuclear Smoke Devil",
];

const raids = ["Chambers of Xeric", "Theatre of Blood", "Tombs of Amascut"];

const hardModeRaids = [
  "Chambers of Xeric: Challenge Mode",
  "Theatre of Blood: Hard Mode",
  "Tombs of Amascut: Expert Mode",
];

const ranksList = [
  "Protector: Fire cape",
  "Bulwark: 1k Slayer bosses",
  "Justicar: 50 raids",
  "Sentry: Elite CAs",
  "Guardian: 100 raids + 10 HM",
  "Warden: Infernal or quiver",
  "Vanguard: Master CAs",
  "Templar: Grandmaster CAs",
];

const quickRaids = ["Cox", "Cox CM", "TOB", "HM TOB", "TOA", "Expert Toa"];
