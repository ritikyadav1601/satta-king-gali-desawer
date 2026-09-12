import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import { slugify } from "@/lib/utils";
import { siteUrl } from "@/lib/site";
import { sanityFetch } from "@/sanity/lib/fetch";
import { CURRENT_SITE, POST_SLUGS_QUERY } from "@/sanity/lib/queries";

// Static month slugs for the last 12 months
function getRecentMonthSlugs() {
  const slugs = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const month = d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).replace(" ", "-");
    slugs.push(`result-chart-${month}`);
  }
  return slugs;
}

export default async function sitemap() {
  const now = new Date();
  const year = now.getUTCFullYear();

  // Fetch active games for dynamic year-chart URLs
  let gameNames = [];
  try {
    await connectDB();
    const games = await Game.find({ isActive: true }).select({ name: 1 }).lean();
    gameNames = games.map((g) => g.name);
  } catch {
    // If DB is unavailable during build, skip dynamic entries
  }

  const staticPages = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1
    },
    {
      url: `${siteUrl}/charts`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: `${siteUrl}/about-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/Privacy-Policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4
    }
  ];

  // Monthly chart pages (last 12 months)
  const monthlyChartPages = getRecentMonthSlugs().map((slug) => ({
    url: `${siteUrl}/chart/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  // Year chart pages for each active game (current year + previous year)
  const yearChartPages = gameNames.flatMap((name) => [
    {
      url: `${siteUrl}/year-chart/${slugify(name)}-result-chart-${year}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: `${siteUrl}/year-chart/${slugify(name)}-result-chart-${year - 1}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6
    }
  ]);

  const blogPosts = await sanityFetch({
    query: POST_SLUGS_QUERY,
    params: { site: CURRENT_SITE },
    fallback: []
  });
  const blogPages = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post._updatedAt ? new Date(post._updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7
  }));

  return [...staticPages, ...monthlyChartPages, ...yearChartPages, ...blogPages];
}
