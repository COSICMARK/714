import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";   // ✅ RainbowKit styles
import "./globals.css";
import { Providers } from "@/app/providers/wagmiClient";

const geistSans = Geist({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZEVRU",
  description: "💙 Ancient vibes",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
