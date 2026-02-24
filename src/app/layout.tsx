import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/context/api-key-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Magic 8 Ball Agentic AI",
  description: "A beautiful dark theme agentic consensus application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-white/10 selection:text-white`}>
        <ApiKeyProvider>
          {children}
        </ApiKeyProvider>
      </body>
    </html>
  );
}
