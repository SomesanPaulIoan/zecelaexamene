"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { SAMEDAY_LOCKER_CONFIG } from "@/lib/shipping";

export type LockerSelection = {
  lockerId: string;
  name: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  oohType: string;
  lat?: number;
  lng?: number;
};

declare global {
  interface Window {
    LockerPlugin?: {
      init: (config: { clientId: string; apiUsername: string; countryCode: string; langCode: string; filters: unknown[]; theme: string }) => void;
      getInstance: () => {
        open: () => void;
        close: () => void;
        subscribe: (cb: (msg: Record<string, unknown>) => void) => void;
      };
    };
  }
}

export function SamedayLockerPicker({
  selected,
  onSelect,
  accentText,
}: {
  selected: LockerSelection | null;
  onSelect: (locker: LockerSelection) => void;
  accentText: string;
}) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (!sdkReady || !window.LockerPlugin) return;
    window.LockerPlugin.init({
      clientId: SAMEDAY_LOCKER_CONFIG.clientId,
      apiUsername: SAMEDAY_LOCKER_CONFIG.apiUsername,
      countryCode: "RO",
      langCode: "ro",
      filters: [{ showLockers: true }, { showPudos: false }],
      theme: "light",
    });
    const plugin = window.LockerPlugin.getInstance();
    plugin.subscribe((msg) => {
      onSelect({
        lockerId: String(msg.lockerId ?? ""),
        name: String(msg.name ?? ""),
        address: String(msg.address ?? ""),
        city: String(msg.city ?? ""),
        county: String(msg.county ?? ""),
        postalCode: String(msg.postalCode ?? ""),
        oohType: String(msg.oohType ?? ""),
        lat: typeof msg.lat === "number" ? msg.lat : undefined,
        lng: typeof msg.lng === "number" ? msg.lng : undefined,
      });
      plugin.close();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady]);

  return (
    <div>
      <Script
        src="https://cdn.sameday.ro/locker-plugin/lockerpluginsdk.js"
        onReady={() => setSdkReady(true)}
      />
      <button
        type="button"
        onClick={() => window.LockerPlugin?.getInstance().open()}
        disabled={!sdkReady}
        className={`rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50`}
      >
        {sdkReady ? "Alege locker" : "Se încarcă…"}
      </button>

      {selected && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className={`font-semibold ${accentText}`}>{selected.name}</p>
          <p className="text-slate-600">
            {selected.address}, {selected.city}, {selected.county} {selected.postalCode}
          </p>
        </div>
      )}
    </div>
  );
}
