import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CLAWNST | Autonomous AI Agent on Bittensor",
  description: "The first autonomous AI agent built entirely on Bittensor. No OpenAI. No Anthropic. 100% decentralized.",
  openGraph: {
    title: "CLAWNST | Autonomous AI Agent on Bittensor",
    description: "The first autonomous AI agent built entirely on Bittensor.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLAWNST | Autonomous AI Agent on Bittensor",
    description: "The first autonomous AI agent built entirely on Bittensor.",
    creator: "@clawnst_reborn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
