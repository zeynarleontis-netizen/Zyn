import { world, Player, system, EntityComponentTypes, EquipmentSlot } from "@minecraft/server";

class Database {
    constructor(name) {
        this.name = `DB_${name}`;
        this.data = {};

        system.run(() => this.initialize());
    }

    initialize() {
        try {
            const rawData = world.getDynamicProperty(this.name);
            this.data = rawData ? JSON.parse(rawData) : {};
        } catch (error) {
            console.warn(`[Database] Gagal mengambil properti ${this.name}: ${error}`);
            world.setDynamicProperty(this.name, "{}");
            this.data = {};
        }
    }

    save() {
        try {
            world.setDynamicProperty(this.name, JSON.stringify(this.data));
        } catch (error) {
            console.error(`[Database] Gagal menyimpan data: ${error}`);
        }
    }

    set(key, value) {
        this.data[key] = value;
        this.save();
    }

    get(key) {
        return this.data[key] ?? undefined;
    }

    has(key) {
        return key in this.data;
    }

    delete(key) {
        if (this.has(key)) {
            delete this.data[key];
            this.save();
        }
    }

    keys() {
        return Object.keys(this.data);
    }

    values() {
        return Object.values(this.data);
    }

    clear() {
        this.data = {};
        this.save();
    }

    forEach(callback) {
        Object.entries(this.data).forEach(([k, v]) => callback(k, v));
    }

    *[Symbol.iterator]() {
        yield* Object.entries(this.data);
    }
}

function getOnlinePlayerCount() {
    const players = system.getPlayers();
    return players.length; 
}

function getServerName() {
    try {
        return world.getDynamicProperty("serverName") || "§l§bBox Essentials";
    } catch (error) {
        console.warn("Gagal mengambil properti serverName:", error.message);
        return "§l§bBox Essentials"; // Default jika gagal
    }
}

let serverName = getServerName();

function truncateString(str, maxLength) {
    return str.length > maxLength ? str.slice(0, maxLength) : str;
}

function getClanName(player) {
    let clanName = player.getTags().find(tag => tag.startsWith('clan:'));
    return clanName ? clanName.replace('clan:', '') : 'No Clan';
}

function getDimensionText(player) {
    const dimension = player.dimension.id;
    switch (dimension) {
        case "minecraft:overworld":
            return "";
        case "minecraft:nether":
            return "";
        case "minecraft:the_end":
            return "";
        default:
            return "§f?";
    }
}

function getDimensionIcon(player) {
    const dimension = player.dimension.id;
    switch (dimension) {
        case "minecraft:overworld":
            return "";
        case "minecraft:nether":
            return "";
        case "minecraft:the_end":
            return "";
        default:
            return "?";
    }
}

function getScore(target, objective) {
  try {
    const oB = world.scoreboard.getObjective(objective);
    if (typeof target === "string") {
      const participant = oB
        .getParticipants()
        .find((pT) => pT.displayName === target);
      const score = participant ? oB.getScore(participant) : 0;
      return score === undefined ? 0 : score;
    }
    const score = oB.getScore(target.scoreboardIdentity);
    return score === undefined ? 0 : score;
  } catch {
    return 0;
  }
}


function formatMetric(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "m";
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + "k"; 
    }
    return value.toString();
}

const defaultRanks = [
    { tag: "Owner", unicode: "" },
    { tag: "Admin", unicode: "" },
    { tag: "Helper", unicode: "" },
    { tag: "Builder", unicode: "" },
    { tag: "Command", unicode: "" },
    { tag: "YouTube", unicode: "" },
    { tag: "Diamond", unicode: "" },
    { tag: "Gold", unicode: "" },
    { tag: "Iron", unicode: "" },
    { tag: "Stone", unicode: "" },
    { tag: "Member", unicode: "" }
];

function saveRankUnicodeToDynamicProperty() {
    for (const rank of defaultRanks) {
        const key = `rankUnicode_${rank.tag}`;
        if (world.getDynamicProperty(key) === undefined) {
            world.setDynamicProperty(key, rank.unicode);
        }
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    saveRankUnicodeToDynamicProperty();
});

function getAllRankTags() {
    const allProps = world.getDynamicPropertyIds();
    return allProps
        .filter(key => key.startsWith("rankUnicode_"))
        .map(key => key.replace("rankUnicode_", ""));
}

function getAllRanks() {
    const tags = getAllRankTags();
    return tags.map(tag => {
        const unicode = world.getDynamicProperty(`rankUnicode_${tag}`) ?? "";
        return { tag, unicode };
    });
}

function getPlayerStatus(player) {
    const tags = getAllRankTags();

    for (const tag of tags) {
        if (player.hasTag(tag)) {
            const unicode = world.getDynamicProperty(`rankUnicode_${tag}`) ?? "";
            return { unicode, rank: tag };
        }
    }

    return { unicode: "", rank: null };
}

function getPlayerUnicodeRank(player) {
    return getPlayerStatus(player).unicode;
}

function getCustomName(player) {
    let customName = player.getTags().find(tag => tag.startsWith('nameTag:'));
    return customName ? customName.replace('nameTag:', '') : player.name;
}

function getSkillData() {
  const raw = world.getDynamicProperty("skillsData");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

world.afterEvents.worldLoad.subscribe(() => {
    const storedName = world.getDynamicProperty("serverName");
    if (storedName) {
        serverName = storedName;
    } else {
        serverName = "§l§bBox Essentials"; 
        world.setDynamicProperty("serverName", serverName);
    }
});

function updateServerName(name) {
    serverName = name;
    world.setDynamicProperty("serverName", serverName);
    world.getDimension("overworld").runCommand(`tellraw @a {"rawtext":[{"text":"§aServer name updated to: §b${serverName}!"}]}`);
}



function playSound(player) {
    const sound = playerSounds.get(player.name) || "note.bell";
    player.runCommand(`playsound ${sound} @s`);
}

function playSounds(player) {
    const sound = playerSoundss.get(player.name) || "note.bass"; 
    player.runCommand(`playsound ${sound} @s`);
}

function playSoundss(player) {
    const sound = playerSoundsss.get(player.name) || "note.bass"; 
    player.runCommand(`playsound ${sound} @s`);
}

const featureStatus = new Database("featureStatus");
const playerSounds = new Database("playerSounds");
const playerSoundss = new Database("playerSoundss");
const playerSoundsss = new Database("playerSoundsss");
const redeemCodes = new Database("redeemCodes");
const playerXPStorage = new Database("playerXPStorage"); 
const newMap = new Database("newMap");
const kontakOwner = new Database("kontakOwner"); 
const spawnCoordinates = new Database("spawnCoordinates");
const pvpCoordinates = new Database("pvpCoordinates");
const miningCoordinates = new Database("miningCoordinates");
const playerProgress = new Database("playerProgress");
const afkCoordinates = new Database("afkCoordinates");
const dbEnable = new Database("enableDB");
let GlobalChatSettings = {
    MaxMessageLength: 100, 
    CooldownTime: 3, 
    LastMessageTimes: new Map(),
};
export let nextClearLagTime = system.currentTick + 12000;
export let isClearLagEnabled = false;
export let toggleClearLag = false;

export { getSkillData, getAllRankTags, saveRankUnicodeToDynamicProperty, getDimensionIcon, getPlayerUnicodeRank, featureStatus, getAllRanks, dbEnable, afkCoordinates, playerProgress, miningCoordinates, pvpCoordinates, spawnCoordinates, kontakOwner, playerXPStorage, newMap, redeemCodes, playerSoundsss, playerSoundss, playSounds, playSoundss, GlobalChatSettings, playerSounds, playSound, getOnlinePlayerCount, Database, updateServerName, serverName, getCustomName, getPlayerStatus, formatMetric, getScore, getDimensionText, getClanName, truncateString };