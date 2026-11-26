export const siteConfig = {
  name: "Maletas Pickup Soccer",
  shortName: "Maletas",
  description:
    "Pickup soccer, fútbol, football. Hosts open their fields, players put their names on the sheet, and the game is on. Jacksonville, FL is the first hub.",
  plusPrice: "$1.99",
  plusPeriod: "month",
} as const;

export const plusBenefits = [
  "Search games by ZIP or postcode and region",
  "Alerts when a sheet opens near you",
  "Early access to sheets that fill fast",
] as const;

export const waiverCopy = {
  title: "Play at your own risk",
  body: "Pickup soccer involves physical contact and a real risk of injury. Maletas is not a league and not a nonprofit. It does not provide insurance, medical coverage, or supervision. You are responsible for your own health, fitness, and gear. You play at your own risk.",
  checkbox: "I understand I play at my own risk and still want to put my name on this sheet.",
} as const;
