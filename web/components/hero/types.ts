/** The model's view of the plan, as the home page's animated Venus receives it. Built in lib/hero.ts. */

/** One moment the caption names, in date order. */
export interface HeroEvent {
  /** Days since 2027-01-01. */
  day: number;
  /** The date as the site writes it, "June 2032". */
  when: string;
  text: string;
  /** The technology page it links to, if any. */
  tech?: string;
}

/** The dates the scene's stages hang on, by model id, in days since 2027-01-01. */
export type HeroDays = Record<string, number>;

export interface HeroData {
  start: number;
  end: number;
  days: HeroDays;
  events: HeroEvent[];
  /** The day-by-day simulation, thinned: [day, value] pairs. */
  temperature: [number, number][];
  pressure: [number, number][];
  oxygen: [number, number][];
  pump: [number, number][];
  /** CO₂ left in the air, in Pa: the CO₂ seas hold what has left it. */
  co2: [number, number][];
  /** Share of Venus-strength sunlight the Veil lets through once it opens. */
  dayTransmission: number;
  earthLikeTemp: number;
  surfaceTemp: number;
  /** Latitude beyond which the Bricks fall, north and south, in degrees; the canopies keep inside it. */
  dropLatitude: number;
  /** Shares of Venus the finished cryo-continents and the new seas cover. */
  capCover: number;
  seaCover: number;
}
