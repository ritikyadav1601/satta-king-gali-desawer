// This is the site's public canonical origin. Keep it stable across Vercel
// previews so search engines always consolidate URLs under the production host.
export const siteUrl = "https://www.sattakinggalidisawar.com";

export function currentSeoDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function getHomeTitle(date = new Date()) {
  return `Satta King Result Today ${currentSeoDate(date)} | Gali, Desawar`;
}

export function getHomeDescription(date = new Date()) {
  return `Satta King Result Today ${currentSeoDate(date)} with Gali, Desawar, Ghaziabad & Faridabad updates, old charts and historical market information.`;
}
