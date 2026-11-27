import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import MetaPixel from "./meta-pixel";
import "./globals.css";

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
    <html lang="pt-br" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Script
          id="utmify-loader"
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          strategy="beforeInteractive"
          data-utmify-prevent-xcod-sck=""
          data-utmify-prevent-subids=""
        />
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
