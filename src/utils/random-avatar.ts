type AvatarFormat = "svg" | "png" | "jpg" | "webp" | "avif" | "json";

type Accessory =
  | "eyepatch"
  | "glasses"
  | "glasses2"
  | "glasses3"
  | "glasses4"
  | "glasses5"
  | "sunglasses"
  | "sunglasses2";

type Face =
  | "angryWithFang"
  | "awe"
  | "blank"
  | "calm"
  | "cheeky"
  | "concerned"
  | "concernedFear"
  | "contempt"
  | "cute"
  | "cyclops"
  | "driven"
  | "eatingHappy"
  | "explaining"
  | "eyesClosed"
  | "fear"
  | "hectic"
  | "lovingGrin1"
  | "lovingGrin2"
  | "monster"
  | "old"
  | "rage"
  | "serious"
  | "smile"
  | "smileBig"
  | "smileLOL"
  | "smileTeethGap"
  | "solemn"
  | "suspicious"
  | "tired"
  | "veryAngry";

type FacialHair =
  | "chin"
  | "full"
  | "full2"
  | "full3"
  | "full4"
  | "goatee1"
  | "goatee2"
  | "moustache1"
  | "moustache2"
  | "moustache3"
  | "moustache4"
  | "moustache5"
  | "moustache6"
  | "moustache7"
  | "moustache8"
  | "moustache9";

type Head =
  | "afro"
  | "bangs"
  | "bangs2"
  | "bantuKnots"
  | "bear"
  | "bun"
  | "bun2"
  | "buns"
  | "cornrows"
  | "cornrows2"
  | "dreads1"
  | "dreads2"
  | "flatTop"
  | "flatTopLong"
  | "grayBun"
  | "grayMedium"
  | "grayShort"
  | "hatBeanie"
  | "hatHip"
  | "hijab"
  | "long"
  | "longAfro"
  | "longBangs"
  | "longCurly"
  | "medium1"
  | "medium2"
  | "medium3"
  | "mediumBangs"
  | "mediumBangs2"
  | "mediumBangs3"
  | "mediumStraight"
  | "mohawk"
  | "mohawk2"
  | "noHair1"
  | "noHair2"
  | "noHair3"
  | "pomp"
  | "shaved1"
  | "shaved2"
  | "shaved3"
  | "short1"
  | "short2"
  | "short3"
  | "short4"
  | "short5"
  | "turban"
  | "twists"
  | "twists2";

type Mask = "medicalMask" | "respirator";

// ─── All possible values ──────────────────────────────────────────────────────

const ALL_ACCESSORIES: Accessory[] = [
  "eyepatch",
  "glasses",
  "glasses2",
  "glasses3",
  "glasses4",
  "glasses5",
  "sunglasses",
  "sunglasses2",
];

const ALL_FACES: Face[] = [
  "angryWithFang",
  "awe",
  "blank",
  "calm",
  "cheeky",
  "concerned",
  "concernedFear",
  "contempt",
  "cute",
  "cyclops",
  "driven",
  "eatingHappy",
  "explaining",
  "eyesClosed",
  "fear",
  "hectic",
  "lovingGrin1",
  "lovingGrin2",
  "monster",
  "old",
  "rage",
  "serious",
  "smile",
  "smileBig",
  "smileLOL",
  "smileTeethGap",
  "solemn",
  "suspicious",
  "tired",
  "veryAngry",
];

const ALL_FACIAL_HAIR: FacialHair[] = [
  "chin",
  "full",
  "full2",
  "full3",
  "full4",
  "goatee1",
  "goatee2",
  "moustache1",
  "moustache2",
  "moustache3",
  "moustache4",
  "moustache5",
  "moustache6",
  "moustache7",
  "moustache8",
  "moustache9",
];

const ALL_HEADS: Head[] = [
  "afro",
  "bangs",
  "bangs2",
  "bantuKnots",
  "bear",
  "bun",
  "bun2",
  "buns",
  "cornrows",
  "cornrows2",
  "dreads1",
  "dreads2",
  "flatTop",
  "flatTopLong",
  "grayBun",
  "grayMedium",
  "grayShort",
  "hatBeanie",
  "hatHip",
  "hijab",
  "long",
  "longAfro",
  "longBangs",
  "longCurly",
  "medium1",
  "medium2",
  "medium3",
  "mediumBangs",
  "mediumBangs2",
  "mediumBangs3",
  "mediumStraight",
  "mohawk",
  "mohawk2",
  "noHair1",
  "noHair2",
  "noHair3",
  "pomp",
  "shaved1",
  "shaved2",
  "shaved3",
  "short1",
  "short2",
  "short3",
  "short4",
  "short5",
  "turban",
  "twists",
  "twists2",
];

const ALL_MASKS: Mask[] = ["medicalMask", "respirator"];

const ALL_SKIN_COLORS = ["694d3d", "ae5d29", "d08b5b", "edb98a", "ffdbb4"];

const ALL_CLOTHING_COLORS = [
  "8fa7df",
  "9ddadb",
  "78e185",
  "e279c7",
  "e78276",
  "fdea6b",
  "ffcf77",
];

const ALL_HEAD_CONTRAST_COLORS = [
  "2c1b18",
  "4a312c",
  "724133",
  "a55728",
  "b58143",
  "c93305",
  "d6b370",
  "e8e1e1",
  "ecdcbf",
  "f59797",
];

const ALL_BACKGROUND_COLORS = [
  "b6e3f4",
  "c0aede",
  "d1d4f9",
  "ffd5dc",
  "ffdfbf",
  "f8f8f8",
  "e0f7e9",
  "fff3cd",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a random item from an array. */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns true with the given probability (0–100). */
function rollChance(probability: number): boolean {
  return Math.random() * 100 < probability;
}

// ─── Options interface ────────────────────────────────────────────────────────

interface OpenPeepsOptions {
  seed?: string;
  format?: AvatarFormat;
  size?: number;
  backgroundColor?: string[];
  accessories?: Accessory[];
  accessoriesProbability?: number;
  clothingColor?: string[];
  face?: Face[];
  facialHair?: FacialHair[];
  facialHairProbability?: number;
  head?: Head[];
  headContrastColor?: string[];
  mask?: Mask[];
  maskProbability?: number;
  skinColor?: string[];
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Generates an avatar URL using the DiceBear open-peeps style.
 *
 * All character traits are randomized client-side when not provided,
 * so calling with no arguments always produces a unique character.
 *
 * @example
 * // Fully random — no arguments needed
 * const url = generateOpenPeepsAvatar();
 *
 * @example
 * // Deterministic — same seed always yields the same character
 * const url = generateOpenPeepsAvatar({ seed: "user-42" });
 *
 * @example
 * // Partially constrained — only override what you care about
 * const url = generateOpenPeepsAvatar({
 *   face: ["smile", "smileBig"],
 *   accessoriesProbability: 0,
 * });
 */
export function generateOpenPeepsAvatar(
  options: OpenPeepsOptions = {},
): string {
  const {
    seed = Math.random().toString(36).slice(2),
    format = "svg",
    size = 128,
    backgroundColor = [pickRandom(ALL_BACKGROUND_COLORS)],
    accessories = [pickRandom(ALL_ACCESSORIES)],
    accessoriesProbability = rollChance(40) ? 100 : 0,
    clothingColor = [pickRandom(ALL_CLOTHING_COLORS)],
    face = [pickRandom(ALL_FACES)],
    facialHair = [pickRandom(ALL_FACIAL_HAIR)],
    facialHairProbability = rollChance(30) ? 100 : 0,
    head = [pickRandom(ALL_HEADS)],
    headContrastColor = [pickRandom(ALL_HEAD_CONTRAST_COLORS)],
    mask = [pickRandom(ALL_MASKS)],
    maskProbability = rollChance(5) ? 100 : 0,
    skinColor = [pickRandom(ALL_SKIN_COLORS)],
  } = options;

  const BASE_URL = "https://api.dicebear.com/9.x/open-peeps";
  const params = new URLSearchParams({ seed });

  params.set("size", String(size));

  const setArray = (key: string, value: string[]) => {
    if (value.length) params.set(key, value.join(","));
  };

  setArray("backgroundColor", backgroundColor);
  setArray("accessories", accessories);
  params.set("accessoriesProbability", String(accessoriesProbability));
  setArray("clothingColor", clothingColor);
  setArray("face", face);
  setArray("facialHair", facialHair);
  params.set("facialHairProbability", String(facialHairProbability));
  setArray("head", head);
  setArray("headContrastColor", headContrastColor);
  setArray("mask", mask);
  params.set("maskProbability", String(maskProbability));
  setArray("skinColor", skinColor);

  return `${BASE_URL}/${format}?${params.toString()}`;
}

// ─── Batch helper ─────────────────────────────────────────────────────────────

/**
 * Generates multiple fully-randomized avatar URLs.
 *
 * @example
 * const avatars = generateMultipleAvatars(5);
 */
export function generateMultipleAvatars(
  count: number,
  options: Omit<OpenPeepsOptions, "seed"> = {},
): string[] {
  return Array.from({ length: count }, () => generateOpenPeepsAvatar(options));
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

/**
 * Fetches the raw SVG markup for a randomly generated avatar.
 *
 * @example
 * const svg = await fetchAvatarSVG();
 * document.getElementById("avatar")!.innerHTML = svg;
 */
export async function fetchAvatarSVG(
  options: Omit<OpenPeepsOptions, "format"> = {},
): Promise<string> {
  const url = generateOpenPeepsAvatar({ ...options, format: "svg" });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch avatar: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}
