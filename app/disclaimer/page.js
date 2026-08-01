import PublicLayout from "@/components/PublicLayout";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata = {
  title: "Disclaimer",
  description:
    "Read the disclaimer for Satta King Fast. The information on this website is provided for record and informational purposes only. Users are responsible for following applicable laws.",
  alternates: {
    canonical: `${siteUrl}/disclaimer`
  },
  openGraph: {
    title: "Disclaimer | Satta King Fast",
    description:
      "The information on this website is provided for record and informational purposes. Visitors are responsible for following all laws applicable in their location.",
    url: `${siteUrl}/disclaimer`,
    type: "website"
  }
};

export default function DisclaimerPage() {
  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="simple-page-title text-2xl font-bold mb-4">Disclaimer</h1>
        <p className="leading-relaxed">
          The information on this website is provided for record and informational purposes.
          Visitors are responsible for following all laws applicable in their location.
        </p>
      </main>
    </PublicLayout>
  );
}
