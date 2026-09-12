import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "./client";

export async function sanityFetch({ query, params = {}, fallback = null }) {
  if (!isSanityConfigured) return fallback;

  try {
    return await sanityClient.fetch(query, params, {
      next: { revalidate: 60 }
    });
  } catch (error) {
    console.error("Sanity query failed:", error.message);
    return fallback;
  }
}
