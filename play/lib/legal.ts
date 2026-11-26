/** Draft matchmaker copy. Pending attorney review. Do not treat as live ToS. */

export const LEGAL_DRAFT_BANNER =
  "Draft pending attorney review. This is not legal advice and is not a binding terms of service until counsel signs off.";

export const MATCHMAKER_ONE_LINER =
  "Maletas is a matchmaker: it collates soccer opportunities around the globe. It is not a nonprofit, not a host, not a field operator, and not an organizer.";

export const MATCHMAKER_SHORT =
  "Maletas is only a matchmaker. It is not a nonprofit and not a host, field operator or organizer, and is not liable for anything involving players, hosts or fields. Each host, field and player works out terms, fees, liability and waivers among themselves.";

export const HOST_NOTICE =
  "You, not Maletas, are the host. You set visibility, fees, terms and your own waiver. Fees are paid directly to you for now. Maletas does not run the field and is not liable for the game.";

export const SIGNUP_NOTICE =
  "By creating a profile you acknowledge that Maletas only collates opportunities. Games, fields, fees and risk sit between hosts, players and field operators. Draft pending attorney review.";

export const termsSections = [
  {
    heading: "What Maletas is",
    body: "Maletas is a matchmaker. The site collates soccer opportunities around the globe so players can find hosts, public pickup, leagues, clubs, watch parties and related listings. Maletas is not a soccer club, not a league, not a nonprofit, not a field operator, and not the organizer of any game you find here.",
  },
  {
    heading: "What Maletas is not liable for",
    body: "Maletas is not liable for anything involving players, hosts, fields, listings, vendors, sponsors, watch parties or third-party sites. That includes injury, death, property damage, disputes over spots or fees, no-shows, field access, weather, discrimination, or content posted by users. You use the site at your own risk.",
  },
  {
    heading: "Hosts, fields and players",
    body: "Each host, field and player works out terms, fees, liability and waivers among themselves. A host may charge a fee, keep a game public, VIP-only or invite-only, hide a field address until they approve a player, and require their own waiver. Maletas does not collect game fees in this version. Where a fee is shown, it is paid directly to the host unless a later Stripe Connect flow says otherwise.",
  },
  {
    heading: "Play at your own risk",
    body: "Pickup soccer involves physical contact and a real risk of injury. You are responsible for your own health, fitness, insurance and gear. Signing a host waiver on this site is an acknowledgement between you and that host. It does not make Maletas a party to the game or create coverage.",
  },
  {
    heading: "Listings from the web",
    body: "Some opportunities are labelled “listed from the web.” Those rows are pointers to third-party sources (leagues, clubs, public pickup pages). Maletas does not verify them, does not claim a partnership, and is not responsible for the source site. Always read the source’s own terms.",
  },
  {
    heading: "VIP, shop and ads",
    body: "Maletas VIP is an optional subscription. In this preview checkout is a demo and nothing is charged. The shop is a matchmaker marketplace: partner and vendor listings with outbound or affiliate links, plus optional Maletas merch later. Ads and local sponsorships are labelled. VIP members see fewer ads.",
  },
  {
    heading: "Accounts and conduct",
    body: "You are responsible for your profile, posts, friend requests, and reports. Do not harass others. Blocking and reporting in this preview are stored in your browser only. Production will store them in the database and review reports.",
  },
] as const;

export const DEFAULT_HOST_TERMS =
  "This is a pickup game. Bring a light shirt and a dark shirt. The host sets kick-off, format and who plays. Fees, if any, are paid directly to the host.";

export const DEFAULT_HOST_WAIVER =
  "I know soccer involves contact and risk of injury. I play at my own risk. The host and the field operator are not my insurer. Maletas is only a matchmaker and is not organizing this game.";
