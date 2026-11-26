export const siteConfig = {
  name: "Maletas Pickup Soccer",
  shortName: "Maletas",
  description:
    "Maletas is a matchmaker that collates soccer opportunities around the globe. Jacksonville, FL is the first hub.",
  vipMonthly: "$1.99",
  vipYearly: "$20",
  vipYearlyWas: "$23.88",
  vipYearlySave: "$3.88",
} as const;

export const vipBenefits = [
  "Access to private and invite-only hosted games",
  "Host email lists",
  "Radius and geographic search alerts",
  "Match alerts when a sheet opens near you",
  "Watch-party alerts (pub viewings of FIFA World Cup and pro league matches)",
] as const;

export const waiverCopy = {
  title: "Host waiver and matchmaker notice",
  checkbox:
    "I accept this host’s waiver, I play at my own risk, and I understand Maletas is only a matchmaker (draft pending attorney review).",
} as const;
