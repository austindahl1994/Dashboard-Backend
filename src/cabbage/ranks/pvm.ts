import { Activity, Details, RankEmbed } from "./rankTypes.ts";

interface RaidKC {
  header: string;
  totalKC: number;
  individualKC: number[];
  hardModeKC: number[];
  details: string[];
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
      details.push(`${value.name}: ${finalValue}`);
      return acc + finalValue;
    } else {
      return acc;
    }
  }, 0);
  details.push(`**__Total: ${totalKC}__**`);
  return { header: "Slayer Bosses", totalKC, details };
};

const calcRaidsKC = (activities: Activity[]): RaidKC => {
  let totalKC = 0;
  const hardModeKC: number[] = [];
  const details: string[] = [];
  const individualKC: number[] = [];
  let counter: number = 0;
  activities.forEach((activity) => {
    if (raids.includes(activity.name)) {
      totalKC += activity.score;
      details.push(
        `${quickRaids[counter]}: ${activity.score > 0 ? activity.score : 0}`
      );
      counter++;
      if (hardModeRaids.includes(activity.name)) {
        const hmIndex = hardModeRaids.indexOf(activity.name);
        hardModeKC.push(Number(activity.score > 0 ? activity.score : 0));
      } else {
        individualKC.push(Number(activity.score));
      }
    }
  });
  return {
    header: "Raids",
    totalKC,
    individualKC: individualKC,
    hardModeKC: hardModeKC,
    details,
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
  ranks.slice(1).forEach((rank, index) => {
    const meetsReq = checkRank(rank, tiers[index]);
    const icon = meetsReq ? "✅" : "❌";
    rankDetails.fields.push(`${icon} ${ranksList[index]}`);
    if (meetsReq && !hitWall) {
      highestRank = index + 1;
    } else {
      hitWall = true;
    }
  });
  const rank = ranks[highestRank];
  const description = `You have achieved the **${rank}** rank in PvM!`;
  const raidDetails: Details = {
    header: raidKC.header,
    fields: raidKC.details,
  };
  const slayerDetails: Details = {
    header: slayKC.header,
    fields: slayKC.details,
  };
  const details: Details[] = [rankDetails, slayerDetails, raidDetails];
  return { title, description, details, rank };
};

const checkRank = (
  rankString: string,
  value: boolean | number | string | RaidKC | SlayerBossKC
) => {
  try {
    // Just return T/F or also return the string/ with checkmark or X?
    switch (rankString) {
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
        const raids = value as RaidKC;
        return (
          raids.individualKC.every((kc) => Number(kc) >= 100) &&
          raids.hardModeKC.every((kc) => Number(kc) >= 10)
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
  "Cabbage",
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

const raids = [
  "Chambers of Xeric",
  "Chambers of Xeric: Challenge Mode",
  "Theatre of Blood",
  "Theatre of Blood: Hard Mode",
  "Tombs of Amascut",
  "Tombs of Amascut: Expert Mode",
];

const hardModeRaids = [
  "Chambers of Xeric: Challenge Mode",
  "Theatre of Blood: Hard Mode",
  "Tombs of Amascut: Expert Mode",
];

const ranksList = [
  "Protector: Fire cape",
  "Bulwark: 1000 slayer boss kc",
  "Justicar: 50 raids kc",
  "Sentry: Elite CAs",
  "Guardian: 100 raid kc + 10 HM",
  "Warden: Infernal or quiver",
  "Vanguard: Master CAs",
  "Templar: Grandmaster CAs",
];

const quickRaids = ["Cox", "Cox CM", "TOB", "HM TOB", "TOA", "Expert Toa"];
