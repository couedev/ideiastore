"use client";

import { useEffect } from "react";

export default function InstalledPwaEntry() {
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) window.location.replace("/aplicativo");
  }, []);

  return null;
}
