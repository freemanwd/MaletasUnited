import { siteConfig } from "@/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: siteConfig.name,
    alternateName: "United Maletas",
    sport: "Soccer",
    email: siteConfig.email,
    url: siteConfig.url,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jacksonville",
      addressRegion: "FL",
      addressCountry: "US",
    },
    sameAs: [siteConfig.facebook],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
