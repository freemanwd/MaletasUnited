import { CLUB, TIER } from "./tier";

export const siteConfig = {
  name: "Maletas Pickup Soccer",
  shortName: "Maletas",
  description:
    "Maletas is a matchmaker that collates soccer opportunities around the globe. Jacksonville, FL is the first hub.",
  marketingSiteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://maletas-united.vercel.app",
  clubMonthly: CLUB.monthly,
  clubYearly: CLUB.yearly,
  clubYearlyWas: CLUB.yearlyWas,
  clubYearlySave: CLUB.yearlySave,
  /** @deprecated use clubMonthly */
  vipMonthly: CLUB.monthly,
  /** @deprecated use clubYearly */
  vipYearly: CLUB.yearly,
  vipYearlyWas: CLUB.yearlyWas,
  vipYearlySave: CLUB.yearlySave,
  tier: TIER,
} as const;

export const clubBenefits = [
  "Access to private and invite-only hosted games",
  "Host email lists",
  "Geo search alerts",
  "Match alerts when a sheet opens near you",
  "Watch-party alerts (pub viewings of FIFA World Cup and pro league matches)",
  "Light local sponsor units only",
] as const;

/** @deprecated use clubBenefits */
export const vipBenefits = clubBenefits;

export const waiverCopy = {
  title: "Host waiver and matchmaker notice",
  checkbox:
    "I accept this host’s waiver, I play at my own risk, and I understand Maletas is only a matchmaker (draft pending attorney review).",
} as const;
