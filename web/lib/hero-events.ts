/**
 * The dates the home page's animated Venus hangs on, and what its caption says on each. Words only:
 * every date comes from the model (lib/hero.ts reads them). Kept apart from lib/hero.ts, which is
 * server-only, so the tests can check this list against the model.
 */
export const DAY_IDS = [
  "program-start",
  "foundry-landing",
  "helios-first-petals",
  "helios-full-power",
  "veil-build-begin",
  "veil-close",
  "cooling-start",
  "cooling-end",
  "ice-launch-start",
  "ice-launch-end",
  "first-arrival",
  "last-arrival",
  "aegis-online",
  "traj-clear-rain",
  "traj-water-rain",
  "traj-rewarm-peak",
  "traj-rerain",
  "traj-water-frozen",
  "traj-freeze",
  "traj-cold",
  "traj-warming",
  "forge-start",
  "forge-end",
  "genesis-start",
  "genesis-end",
  "traj-earth-like",
  "deadline",
] as const;

/** What the caption says on each date. Words only; the dates come from the model. */
export const EVENTS: { id: (typeof DAY_IDS)[number]; text: string; tech?: string }[] = [
  { id: "program-start", text: "Nine proof experiments begin on Earth" },
  { id: "foundry-landing", text: "A self-copying foundry lands on Mercury", tech: "ouroboros" },
  {
    id: "helios-first-petals",
    text: "The Helios Lattice starts to gather sunlight",
    tech: "helios",
  },
  { id: "veil-close", text: "The Hesperus Veil closes, and Venus goes dark", tech: "veil" },
  { id: "ice-launch-start", text: "The first Ice Bricks leave Ceres", tech: "ice-train" },
  {
    id: "cooling-start",
    text: "The Lattice's light starts the Photonic Exhaust pumping heat to space",
    tech: "exhaust",
  },
  { id: "aegis-online", text: "The Aegis Shield turns the solar wind aside", tech: "aegis" },
  { id: "traj-clear-rain", text: "The Clear Rain: the air itself starts to fall", tech: "cryo" },
  {
    id: "first-arrival",
    text: "The first Bricks burst in the polar air, far from the canopies",
    tech: "ice-train",
  },
  { id: "traj-water-rain", text: "The new water rains out into the lowlands", tech: "ice-train" },
  {
    id: "traj-rewarm-peak",
    text: "The Bricks' heat warms the air back, and the first CO₂ seas boil away",
    tech: "ice-train",
  },
  { id: "forge-start", text: "The Graphite Forges start making oxygen", tech: "forges" },
  { id: "traj-water-frozen", text: "The air drops below freezing, and the new seas freeze" },
  { id: "traj-freeze", text: "The CO₂ seas freeze into continents of dry ice", tech: "cryo" },
  {
    id: "traj-warming",
    text: "The dry ice is sealed and the Veil opens to daylight",
    tech: "veil",
  },
  { id: "traj-earth-like", text: "Earth-like: warm air to breathe, the seas melted" },
  { id: "genesis-start", text: "Genesis seeds the new seas with life", tech: "genesis" },
];
