/**
 * Master Shot-by-Shot Story Architecture for "The Great Boston Molasses Tsunami of 1919"
 * Based on approved Shot-by-Shot Visual Gag Board & Kokoro-82M Voiceover Alignment.
 */

export interface MolassesShotDef {
  shotIndex: number;
  name: string;
  startFrame: number;
  endFrame: number;
  startSec: number;
  endSec: number;
  text: string;
  tag: string;
  headline: string;
  badgeColor: string;
  gagType:
    | "shot1_gauge_speedo"
    | "shot2_tinfoil_tank"
    | "shot3_angry_mob"
    | "shot4_painter_ladder"
    | "shot5_calendar_thermometer"
    | "shot6_bloated_tank"
    | "shot7_machinegun_rivets"
    | "shot8_flash_bridge"
    | "shot9_tsunami_surf"
    | "shot10_railway_collapse"
    | "shot11_rafting_crate"
    | "shot12_acid_contrast"
    | "shot13_shoe_pop"
    | "shot14_ketchup_avalanche"
    | "shot15_pancake_bricks";
}

export const MOLASSES_SHOTS_EN: MolassesShotDef[] = [
  {
    shotIndex: 1,
    name: "The Impossible Hook",
    startFrame: 0,
    endFrame: 208,
    startSec: 0.0,
    endSec: 6.949,
    text: "In 1919, a two-million-gallon wave of warm syrup drowned a city at thirty-five miles an hour.",
    tag: "BOSTON • JAN 15, 1919",
    headline: "THE SWEET TSUNAMI",
    badgeColor: "#facc15",
    gagType: "shot1_gauge_speedo",
  },
  {
    shotIndex: 2,
    name: "The Tin Foil Tank",
    startFrame: 208,
    endFrame: 337,
    startSec: 6.949,
    endSec: 11.23,
    text: "The problem? The company built the giant steel tank way too thin.",
    tag: "FATAL FLAW",
    headline: "TIN FOIL STEEL TANK",
    badgeColor: "#d97706",
    gagType: "shot2_tinfoil_tank",
  },
  {
    shotIndex: 3,
    name: "Angry Town Mob",
    startFrame: 337,
    endFrame: 460,
    startSec: 11.23,
    endSec: 15.33,
    text: "When locals complained that syrup was dripping through the seams...",
    tag: "LEAK COMPLAINTS",
    headline: "IT'S STICKY! MOB PROTEST",
    badgeColor: "#ef4444",
    gagType: "shot3_angry_mob",
  },
  {
    shotIndex: 4,
    name: "The Brown Paint Cover-Up",
    startFrame: 460,
    endFrame: 596,
    startSec: 15.33,
    endSec: 19.872,
    text: "...the company literally painted the entire tank brown so nobody could see the leaks.",
    tag: "THE COVER-UP",
    headline: "BROWN PAINT HACK",
    badgeColor: "#b45309",
    gagType: "shot4_painter_ladder",
  },
  {
    shotIndex: 5,
    name: "Calendar Flip & Exploding Thermometer",
    startFrame: 596,
    endFrame: 767,
    startSec: 19.872,
    endSec: 25.574,
    text: "Then, on January fifteenth, the temperature jumped thirty degrees in a few hours.",
    tag: "JAN 15 • +30° SPIKE",
    headline: "SUDDEN WINTER HEATWAVE",
    badgeColor: "#ef4444",
    gagType: "shot5_calendar_thermometer",
  },
  {
    shotIndex: 6,
    name: "Bloated Balloon Tank",
    startFrame: 767,
    endFrame: 928,
    startSec: 25.574,
    endSec: 30.917,
    text: "The cold molasses began fermenting, releasing gas, and ballooning the internal pressure.",
    tag: "FERMENTATION",
    headline: "BALLOONING PRESSURE",
    badgeColor: "#ef4444",
    gagType: "shot6_bloated_tank",
  },
  {
    shotIndex: 7,
    name: "Machine-Gun Rivets",
    startFrame: 928,
    endFrame: 1129,
    startSec: 30.917,
    endSec: 37.637,
    text: "Chains groaned, the steel warped, and suddenly the heavy iron rivets sheared off like machine-gun fire.",
    tag: "RIVET FAILURE",
    headline: "MACHINE-GUN RIVET POP",
    badgeColor: "#dc2626",
    gagType: "shot7_machinegun_rivets",
  },
  {
    shotIndex: 8,
    name: "Omi Hook Flash Bridge",
    startFrame: 1129,
    endFrame: 1132,
    startSec: 37.637,
    endSec: 37.717,
    text: "",
    tag: "RUPTURE",
    headline: "THE BURST",
    badgeColor: "#ffffff",
    gagType: "shot8_flash_bridge",
  },
  {
    shotIndex: 9,
    name: "The Sugar Tsunami Surf",
    startFrame: 1132,
    endFrame: 1386,
    startSec: 37.717,
    endSec: 46.203,
    text: "Two point three million gallons of sticky syrup exploded into the street as a twenty-five-foot tidal wave moving at thirty-five miles an hour.",
    tag: "2.3M GALLONS",
    headline: "25-FOOT GLUCOSE TSUNAMI",
    badgeColor: "#f59e0b",
    gagType: "shot9_tsunami_surf",
  },
  {
    shotIndex: 10,
    name: "Matchstick Railway Collapse",
    startFrame: 1386,
    endFrame: 1485,
    startSec: 46.203,
    endSec: 49.5,
    text: "It snapped elevated train tracks like matchsticks, flattened brick buildings...",
    tag: "TRAIN TRACKS SNAPPED",
    headline: "ELEVATED RAILWAY COLLAPSE",
    badgeColor: "#38bdf8",
    gagType: "shot10_railway_collapse",
  },
  {
    shotIndex: 11,
    name: "The Serenely Rafting Citizen",
    startFrame: 1485,
    endFrame: 1589,
    startSec: 49.5,
    endSec: 52.981,
    text: "...and knocked horses right off their feet.",
    tag: "FLOATING DEBRIS",
    headline: "RAFTING ON WOODEN CRATE",
    badgeColor: "#38bdf8",
    gagType: "shot11_rafting_crate",
  },
  {
    shotIndex: 12,
    name: "Acid vs Syrup Comic Contrast",
    startFrame: 1589,
    endFrame: 1689,
    startSec: 52.981,
    endSec: 56.296,
    text: "Luckily, it was sweet molasses, not boiling acid.",
    tag: "SWEET NOT ACID",
    headline: "TASTING THE SYRUP",
    badgeColor: "#10b981",
    gagType: "shot12_acid_contrast",
  },
  {
    shotIndex: 13,
    name: "Clean Shoe-Pop Gag & Frozen Dog",
    startFrame: 1689,
    endFrame: 1915,
    startSec: 56.296,
    endSec: 63.835,
    text: "Unluckily, cold molasses doesn't splash like water — it sets like wet concrete, gluing people to the sidewalk.",
    tag: "WET CONCRETE",
    headline: "SHOE-POP & FROZEN STATUES",
    badgeColor: "#10b981",
    gagType: "shot13_shoe_pop",
  },
  {
    shotIndex: 14,
    name: "The 57 Ketchup Bottle Avalanche",
    startFrame: 1915,
    endFrame: 2175,
    startSec: 63.835,
    endSec: 72.501,
    text: "You see, syrup is a non-Newtonian fluid. Ever banged a cold ketchup bottle? Nothing moves, until the whole bottle dumps on your plate at once.",
    tag: "NON-NEWTONIAN",
    headline: "THE KETCHUP EFFECT",
    badgeColor: "#ef4444",
    gagType: "shot14_ketchup_avalanche",
  },
  {
    shotIndex: 15,
    name: "Pancake Aroma Sniff",
    startFrame: 2175,
    endFrame: 2375,
    startSec: 72.501,
    endSec: 79.168,
    text: "And even today, Boston locals swear that on a hot summer day, the old bricks still smell of pancakes.",
    tag: "BOSTON LEGEND",
    headline: "WARM BRICKS & PANCAKES",
    badgeColor: "#facc15",
    gagType: "shot15_pancake_bricks",
  },
];

export const getShotAtFrame = (frame: number): MolassesShotDef => {
  return (
    MOLASSES_SHOTS_EN.find((s) => frame >= s.startFrame && frame < s.endFrame) ??
    MOLASSES_SHOTS_EN[MOLASSES_SHOTS_EN.length - 1]
  );
};
