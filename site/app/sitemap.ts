import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/history", "/photos", "/join", "/going-global"];
  return paths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
