import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/context/api-key-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jev 8 Ball",
  description:
    "Ask yes/no questions and get calibrated Magic 8-ball answers from TypeSafe Jev via OpenRouter — entirely in your browser.",
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
