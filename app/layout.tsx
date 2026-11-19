import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amigo Secreto Natalino",
  description: "Prepare seu Amigo Secreto Natalino.",
  applicationName: "Amigo Secreto Natalino",
  appleWebApp: {
    capable: true,
    title: "Amigo Secreto",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      {
        url: "/icon/icon-storeideias-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon/icon-storeideias-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icon/icon-storeideias-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#15362C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
