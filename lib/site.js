const fallbackSiteUrl = "https://sattakinggalidisawar.com";

function normalizeSiteUrl(value) {
  if (!value) return null;

  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  normalizeSiteUrl(process.env.VERCEL_URL) ||
  fallbackSiteUrl;

export const homeTitle = "Satta King Result Today | Gali, Desawar & Ghaziabad";
export const homeDescription =
  "Check today's Satta King results for Gali, Desawar, Ghaziabad and Faridabad, with daily updates and old chart records from 2015 onward.";
