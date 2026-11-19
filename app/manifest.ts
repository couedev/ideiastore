import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amigo Secreto Natalino",
    short_name: "Amigo Secreto",
    description: "Prepare seu Amigo Secreto Natalino.",
    id: "/",
    start_url: "/aplicativo",
    scope: "/",
    display: "standalone",
    background_color: "#F8F5EA",
    theme_color: "#15362C",
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
