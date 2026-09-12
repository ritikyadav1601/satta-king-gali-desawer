"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/sanity/env";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="sanity-setup">
        <h1>Connect Sanity Studio</h1>
        <p>
          Add <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
          <code>NEXT_PUBLIC_SANITY_DATASET</code> to <code>.env.local</code>, then restart the app.
        </p>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
