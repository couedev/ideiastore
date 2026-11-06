"use client";

import { useRef } from "react";
import Script from "next/script";

const PIXEL_ID = "1584821460029460";

const pixelBootstrap = `
  !function(f){
    if(f.fbq)return;
    var n=f.fbq=function(){
      n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
    };
    if(!f._fbq)f._fbq=n;
    n.push=n;
    n.loaded=true;
    n.version='2.0';
    n.queue=[];
  }(window);
`;

declare global {
  interface Window {
    fbq?: (action: string, ...args: unknown[]) => void;
    __ideiasStorePixelInitialized?: boolean;
  }
}

export default function MetaPageView() {
  const pageViewEnviado = useRef(false);

  const registrarPageView = () => {
    if (pageViewEnviado.current || !window.fbq) return;

    if (!window.__ideiasStorePixelInitialized) {
      window.fbq("init", PIXEL_ID);
      window.__ideiasStorePixelInitialized = true;
    }

    window.fbq("track", "PageView");
    pageViewEnviado.current = true;
  };

  return (
    <>
      <Script
        id="ideias-store-meta-pixel-bootstrap"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: pixelBootstrap }}
      />
      <Script
        id="ideias-store-meta-pixel-library"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
        onReady={registrarPageView}
      />
    </>
  );
}
