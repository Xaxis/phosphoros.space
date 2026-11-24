/**
 * The dates the journey hangs on, and what its caption says on each. Words only: every date comes
 * from the model (lib/journey.ts reads them). Kept apart from the builder so the tests can check
 * this list against the model without the site.
 */
import type { Chapter } from "../components/journey/types";

/** Every model date the scene's stages read, besides the captioned ones. */
export const DAY_IDS = [
  "program-start",
  "survey-start",
  "life-gate",
  "experiments-end",
  "foundry-seed-launch",
  "ceres-seed-launch",
  "foundry-landing",
  "ceres-landing",
  "helios-first-petals",
  "veil-build-begin",
  "veil-build-end",
  "veil-close",
  "ceres-full-scale",
  "ceres-ready",
  "foundry-full-scale",
  "helios-full-power",
  "ice-launch-start",
  "ice-launch-end",
  "venus-hardware-ready",
  "cooling-start",
  "cooling-end",
  "aegis-online",
  "traj-clear-rain",
  "first-arrival",
  "last-arrival",
  "traj-water-rain",
  "traj-rewarm-peak",
  "traj-rerain",
  "forge-start",
  "forge-end",
  "traj-water-frozen",
  "traj-freeze",
  "traj-frozen",
  "traj-cold",
  "sealing-end",
  "traj-warming",
  "traj-earth-like",
  "genesis-start",
  "genesis-land-start",
  "genesis-end",
  "deadline",
] as const;

export type DayId = (typeof DAY_IDS)[number];

/** What the caption says on each date, and where the story is. Words only. */
export const EVENTS: { id: DayId; text: string; chapter: Chapter; tech?: string }[] = [
  {
    id: "program-start",
    chapter: "earth",
    text: "Nine proof experiments begin, on Earth and in orbit",
  },
  {
    id: "life-gate",
    chapter: "earth",
    text: "Balloons find no native life in Venus's clouds, so the plan goes ahead",
  },
  {
    id: "foundry-seed-launch",
    chapter: "earth",
    text: "Two seed factories leave Earth: one for Mercury, one for Ceres",
    tech: "ouroboros",
  },
  {
    id: "foundry-landing",
    chapter: "mercury",
    text: "The seed lands at Mercury's pole and starts to copy itself",
    tech: "ouroboros",
  },
  {
    id: "ceres-landing",
    chapter: "ceres",
    text: "The second seed lands on Ceres and starts to build factories",
    tech: "ice-train",
  },
  {
    id: "helios-first-petals",
    chapter: "lattice",
    text: "The first Helios Petals fly, and test slats for the Veil",
    tech: "helios",
  },
  {
    id: "veil-build-begin",
    chapter: "lattice",
    text: "The Foundry pauses to make the Veil's slats and throws them toward Venus",
    tech: "veil",
  },
  {
    id: "veil-close",
    chapter: "venus",
    text: "The Hesperus Veil closes, and Venus goes dark",
    tech: "veil",
  },
  {
    id: "ceres-full-scale",
    chapter: "ceres",
    text: "Ceres's factories turn to the Railheads and the Crown",
    tech: "ice-train",
  },
  {
    id: "foundry-full-scale",
    chapter: "lattice",
    text: "The Foundry stops growing and turns out Petals by the million",
    tech: "helios",
  },
  {
    id: "helios-full-power",
    chapter: "lattice",
    text: "The Helios Lattice reaches full power",
    tech: "helios",
  },
  {
    id: "ice-launch-start",
    chapter: "ceres",
    text: "The Lattice powers the Crown, and the Railheads fire the first Ice Bricks",
    tech: "ice-train",
  },
  {
    id: "ice-launch-end",
    chapter: "lattice",
    text: "The last Bricks leave Ceres on their long fall toward the Sun",
    tech: "ice-train",
  },
  {
    id: "cooling-start",
    chapter: "venus",
    text: "Canopies rise over Venus, and the Lattice's light starts the Exhaust pumping heat to space",
    tech: "exhaust",
  },
  {
    id: "aegis-online",
    chapter: "venus",
    text: "The Aegis Shield turns the solar wind aside",
    tech: "aegis",
  },
  {
    id: "traj-clear-rain",
    chapter: "venus",
    text: "The Clear Rain: the air itself starts to fall",
    tech: "cryo",
  },
  {
    id: "first-arrival",
    chapter: "venus",
    text: "The first Bricks burst in the polar air, far from the canopies",
    tech: "ice-train",
  },
  {
    id: "traj-water-rain",
    chapter: "venus",
    text: "The new water rains out into the lowlands",
    tech: "ice-train",
  },
  {
    id: "traj-rewarm-peak",
    chapter: "venus",
    text: "The Bricks' heat warms the air back, and the first CO₂ seas boil away",
    tech: "ice-train",
  },
  {
    id: "traj-rerain",
    chapter: "venus",
    text: "The CO₂ rain returns for good, and the Forge rafts float out onto the seas",
    tech: "forges",
  },
  {
    id: "forge-start",
    chapter: "venus",
    text: "The Graphite Forges start making oxygen",
    tech: "forges",
  },
  {
    id: "traj-water-frozen",
    chapter: "venus",
    text: "The air drops below freezing, and the new seas freeze",
  },
  {
    id: "traj-freeze",
    chapter: "venus",
    text: "The CO₂ seas freeze into continents of dry ice",
    tech: "cryo",
  },
  {
    id: "traj-frozen",
    chapter: "venus",
    text: "Frozen through: crawler-rafts start sealing the dry ice under caps",
    tech: "cryo",
  },
  {
    id: "traj-warming",
    chapter: "venus",
    text: "The caps are sealed, and the Veil opens to daylight",
    tech: "veil",
  },
  {
    id: "traj-earth-like",
    chapter: "venus",
    text: "Earth-like: warm air to breathe, the seas melted",
  },
  {
    id: "genesis-start",
    chapter: "venus",
    text: "Genesis seeds the new seas with life",
    tech: "genesis",
  },
  { id: "genesis-end", chapter: "venus", text: "The seas turn green", tech: "genesis" },
];
