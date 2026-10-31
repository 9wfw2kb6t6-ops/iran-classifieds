import type { MetadataRoute } from "next";

const base = "https://iran-classifieds.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/help", "/terms", "/privacy"];
  return pages.map((path) => ({
    url: base + path,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.5
  }));
}