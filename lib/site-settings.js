import { CURRENT_SITE, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/fetch";
import { siteConfig } from "@/lib/site-config";

// Khaiwal name and WhatsApp number come from Sanity (Site Settings).
// If Sanity is not configured or has no settings yet, fall back to lib/site-config.js.
export async function getSiteSettings() {
  const settings = await sanityFetch({
    query: SITE_SETTINGS_QUERY,
    params: { site: CURRENT_SITE },
    fallback: null
  });

  return {
    khaiwalName: String(settings?.khaiwalName || "").trim() || siteConfig.khaiwalName,
    whatsappNumber: String(settings?.whatsappNumber || "").replace(/\D/g, "") || siteConfig.whatsappNumber
  };
}
