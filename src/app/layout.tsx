/**
 * layout.tsx
 * 
 * Root layout with SEO optimization for Claude Code Countdown.
 * Update when: changing site-wide metadata, fonts, or adding providers.
 */

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://claudecodecountdown.com'),
  title: {
    default: "Claude Code Countdown - Track When Your Access Returns",
    template: "%s | Claude Code Countdown"
  },
  description: "Free countdown timer for Claude Code rate limits. Enter your reset time, get SMS notifications 5 minutes before access returns. Never miss your Claude Code access window again.",
  keywords: [
    "Claude Code",
    "Claude Code countdown",
    "Claude Code rate limit",
    "Claude Code access timer",
    "Claude Code reset timer",
    "Anthropic Claude",
    "AI coding assistant",
    "Claude Code limit tracker",
    "Claude Code SMS notification"
  ],
  authors: [{ name: "Carter LaSalle", url: "https://github.com/carterlasalle" }],
  creator: "Carter LaSalle",
  publisher: "Carter LaSalle",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://claudecodecountdown.com",
    siteName: "Claude Code Countdown",
    title: "Claude Code Countdown - Track When Your Access Returns",
    description: "Free countdown timer for Claude Code rate limits. Get SMS notifications when your access is about to return.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Claude Code Countdown Timer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Code Countdown - Track When Your Access Returns",
    description: "Free countdown timer for Claude Code rate limits. Get SMS notifications when your access is about to return.",
    images: ["/og-image.png"],
    creator: "@carterlasalle",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://claudecodecountdown.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <link rel="canonical" href="https://claudecodecountdown.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Claude Code Countdown",
              "description": "Free countdown timer for Claude Code rate limits with SMS notifications",
              "url": "https://claudecodecountdown.com",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Carter LaSalle",
                "url": "https://github.com/carterlasalle"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
