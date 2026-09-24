import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/context/api-key-context";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://8-ball.codefundi.app";
const TAGLINE = "The worlds most powerful Magic 8 Ball powered by Jev";
const TITLE = `Jev 8 Ball — ${TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description:
    "Ask yes/no questions or scan a GitHub repo, and get calibrated Magic 8-ball answers from TypeSafe Jev. Powered by CodeFundi and Jev.",
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png" },
    ],
    apple: "/apple-icon",
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Jev 8 Ball",
    title: TITLE,
    description: TAGLINE,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: TAGLINE,
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-white/10 selection:text-white overflow-x-hidden`}
      >
        <ApiKeyProvider>{children}</ApiKeyProvider>
      </body>
    </html>
  );
}
