"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, params: { sitekey: string }) => number;
    };
    __recaptchaOnLoad?: () => void;
  }
}

let recaptchaReady: Promise<void> | null = null;

function waitForRecaptcha(): Promise<void> {
  if (!recaptchaReady) {
    recaptchaReady = new Promise((resolve) => {
      window.__recaptchaOnLoad = resolve;
    });
  }
  return recaptchaReady;
}

export function Recaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    waitForRecaptcha().then(() => {
      if (cancelled || renderedRef.current || !containerRef.current || !window.grecaptcha) return;
      window.grecaptcha.render(containerRef.current, { sitekey: siteKey });
      renderedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?onload=__recaptchaOnLoad&render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} />
    </>
  );
}
