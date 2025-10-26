export type Moment = {
  slug: "evening-rain" | "midnight-garden" | "morning-mix" | "tropical-noon";
  title: string;
  subtitle: string;
};

export const MOMENTS: Moment[] = [
  { slug: "evening-rain",    title: "Evening Rain",    subtitle: "gentle drops • bamboo bells • moss" },
  { slug: "midnight-garden", title: "Midnight Garden", subtitle: "night air • quiet chorus • stars" },
  { slug: "morning-mix",     title: "Morning Mix",     subtitle: "dawn light • soft leaves • distant water" },
  { slug: "tropical-noon",   title: "Tropical Noon",   subtitle: "warm breeze • cicadas • shallow waves" },
];

export const getMoment = (slug: Moment["slug"]) =>
  MOMENTS.find((m) => m.slug === slug);