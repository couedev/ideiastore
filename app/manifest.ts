import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ideias Store",
    short_name: "Ideias Store",
    description: "Ideias de conteúdo para sua loja.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c13584",
    icons: [
      {
        src: "/icon/icon-storeideias-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon/icon-storeideias-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
