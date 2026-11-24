/**
 * The model's view of the plan, as the journey receives it. Built by web/lib/journey.ts from one
 * run of the model: the published one on the home page, the reader's variant in the Explorer.
 */

/** Where the story is: the camera's home for each stretch of it. */
export type Chapter = "earth" | "mercury" | "ceres" | "lattice" | "venus";

/** One moment the caption names, in date order. */
export interface JourneyEvent {
  /** Days since 2027-01-01. */
  day: number;
  /** The date as the site writes it, "June 2032". */
  when: string;
  text: string;
  chapter: Chapter;
  /** The technology page it links to, if any. */
  tech?: string;
}

/** The dates the scene's stages hang on, by model id, in days since 2027-01-01. */
export type JourneyDays = Record<string, number>;

/** A reading the dialog shows beside the scene, from the model's own series. */
export interface Readout {
  id: string;
  label: string;
  /** [day, value] pairs, thinned. */
  points: [number, number][];
  /** How to write a value: kelvin, a pressure, a power. */
  kind: "temperature" | "pressure" | "power" | "share";
  /** Held flat before the first point (true) or shown as not yet started (false). */
  holdBefore: boolean;
}

export interface JourneyData {
  start: number;
  end: number;
  /** The plan's deadline. A late variant's story runs on past it, to its own last event. */
  deadline: number;
  /**
   * The simulation's last day. It dates an event it never reached at its horizon, past this day:
   * that event did not happen in this variant, and the story leaves it out.
   */
  simulated: number;
  days: JourneyDays;
  events: JourneyEvent[];
  /** The inputs the worlds' places are computed from (calc's PLACE_INPUTS). */
  elements: Record<string, number>;
  /** The day-by-day simulation, thinned: [day, value] pairs. */
  temperature: [number, number][];
  pressure: [number, number][];
  oxygen: [number, number][];
  pump: [number, number][];
  /** CO₂ left in the air, in Pa: the CO₂ seas hold what has left it. */
  co2: [number, number][];
  readouts: Readout[];
  /** Share of Venus-strength sunlight the Veil lets through once it opens. */
  dayTransmission: number;
  surfaceTemp: number;
  /** Latitude beyond which the Bricks fall, north and south, in degrees; the canopies keep inside it. */
  dropLatitude: number;
  /** Shares of Venus the finished cryo-continents and the new seas cover. */
  capCover: number;
  seaCover: number;
  /** Doubling times, days: the Foundry on Mercury and the factories on Ceres. */
  foundryDoubling: number;
  ceresDoubling: number;
  /** Where the Petals orbit, AU. */
  latticeInner: number;
  latticeOuter: number;
  /** Sizes against their world's radius: the Veil's disc, a canopy, the Crown's ring and fins. */
  veilRadius: number;
  canopyWidth: number;
  crownRadius: number;
  crownFins: number;
}
