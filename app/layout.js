import "./colors.css";
import "./globals.css";
import { getHomeDescription, getHomeTitle, siteUrl } from "@/lib/site";

export function generateMetadata() {
  const title = getHomeTitle();
  const description = getHomeDescription();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | Satta King Fast"
    },
    description,
    authors: [{ name: "Satta King Gali Disawar", url: siteUrl }],
    creator: "Satta King Gali Disawar",
    publisher: "Satta King Gali Disawar",
    keywords: [
      "satta king",
      "satta king result",
      "satta king fast",
      "gali result",
      "desawar result",
      "ghaziabad result",
      "faridabad result",
      "satta king chart",
      "satta result today",
      "satta king 2025",
      "satta king online",
      "black satta king",
      "satta king record chart",
      "satta king old chart"
    ],
    verification: {
      google: "atrP2Nan2ywH60TPdfGhm7mUuD2X5ZJEVAm_FFBlKWQ"
    },
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "Satta King Fast",
      type: "website",
      locale: "en_IN"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1
      }
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "64x64" }
      ],
      apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
      shortcut: "/favicon.ico"
    }
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="atrP2Nan2ywH60TPdfGhm7mUuD2X5ZJEVAm_FFBlKWQ" />
        <link rel="stylesheet" href="/asset/app.css" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
