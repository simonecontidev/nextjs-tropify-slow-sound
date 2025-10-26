export type Moment = {
  slug: "morning-mist" | "tropical-noon" | "evening-rain" | "midnight-garden";
  title: string;
  subtitle: string;
};

export const MOMENTS: Moment[] = [
  {
    slug: "morning-mist",
    title: "Morning Mist",
    subtitle: "dawn light • soft leaves • distant water",
  },
  {
    slug: "tropical-noon",
    title: "Tropical Noon",
    subtitle: "warm breeze • cicadas • shallow waves",
  },
  {
    slug: "evening-rain",
    title: "Evening Rain",
    subtitle: "gentle drops • bamboo bells • moss",
  },
  {
    slug: "midnight-garden",
    title: "Midnight Garden",
    subtitle: "night air • quiet chorus • stars",
  },
];

export const getMoment = (slug: Moment["slug"]) =>
  MOMENTS.find((m) => m.slug === slug);