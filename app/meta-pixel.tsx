"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const pixelId = "4594079167544551";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function isTrackedPath(pathname: string) {
  return ["/", "/secretonatalino", "/funil", "/atividadesbilateral"].includes(pathname);
}

export default function MetaPixel() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const isTracked = isTrackedPath(pathname);

  useEffect(() => {
    const previous = previousPathname.current;
    previousPathname.current = pathname;

    if (previous === null || previous === pathname || !isTracked) return;
    window.fbq?.("track", "PageView");
  }, [isTracked, pathname]);

  if (!isTracked) return null;

  return (
    <>
      <Script id="meta-pixel-bootstrap" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* O beacon do Pixel precisa de uma imagem simples de 1x1, sem otimização do Next. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
