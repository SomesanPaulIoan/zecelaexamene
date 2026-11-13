"use client";

import { useState } from "react";
import { formatDuration, formatVideoTime } from "@/lib/content";

export type OverviewBlock = { title: string; icon: string; items: string[] };

export type VideoData = {
  id: string;
  title: string;
  vimeoId: string;
  durationSec: number | null;
  isFreePreview: boolean;
};

export type PartData = {
  id: string;
  title: string;
  summary: string | null;
  videos: VideoData[];
};

export type ReviewData = {
  id: string;
  authorName: string;
  stars: number;
  comment: string | null;
};

const TABS = [
  { key: "overview", label: "Descriere" },
  { key: "curriculum", label: "Curriculă" },
  { key: "reviews", label: "Recenzii" },
] as const;

const BLOCK_THEMES = [
  { bg: "bg-blue-50", ring: "ring-blue-100", icon: "bg-blue-500" },
  { bg: "bg-violet-50", ring: "ring-violet-100", icon: "bg-violet-500" },
  { bg: "bg-amber-50", ring: "ring-amber-100", icon: "bg-amber-500" },
  { bg: "bg-emerald-50", ring: "ring-emerald-100", icon: "bg-emerald-500" },
  { bg: "bg-rose-50", ring: "ring-rose-100", icon: "bg-rose-500" },
];

type TabKey = (typeof TABS)[number]["key"];

export function CourseTabs({
  overviewBlocks,
  contentHtml,
  parts,
  reviews,
  hasAccess,
  accentSolid,
  accentGradient,
  accentText,
}: {
  overviewBlocks: OverviewBlock[];
  contentHtml: string | null;
  parts: PartData[];
  reviews: ReviewData[];
  hasAccess: boolean;
  accentSolid: string;
  accentGradient: string;
  accentText: string;
}) {
  const [tab, setTab] = useState<TabKey>(parts.length > 0 ? "curriculum" : "overview");
  const [openPartId, setOpenPartId] = useState<string | null>(parts[0]?.id ?? null);
  const [playingVideo, setPlayingVideo] = useState<VideoData | null>(null);

  const totalVideos = parts.reduce((sum, p) => sum + p.videos.length, 0);
  const totalSeconds = parts.reduce(
    (sum, p) => sum + p.videos.reduce((s, v) => s + (v.durationSec ?? 0), 0),
    0
  );
  const avgStars = reviews.length ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0;

  return (
    <div>
      <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-sm font-medium">
        {TABS.map((t) => {
          if (t.key === "reviews" && reviews.length === 0) return null;
          if (t.key === "curriculum" && parts.length === 0) return null;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-full px-4 py-2 transition ${
                active ? `${accentSolid} text-white shadow-sm` : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
              {t.key === "reviews" && reviews.length > 0 && ` (${reviews.length})`}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "overview" && (
          <div>
            {overviewBlocks.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {overviewBlocks.map((block, i) => {
                  const theme = BLOCK_THEMES[i % BLOCK_THEMES.length];
                  const isLastOdd = overviewBlocks.length % 2 === 1 && i === overviewBlocks.length - 1;
                  return (
                    <div
                      key={block.title}
                      className={`rounded-3xl ${theme.bg} p-6 ring-1 ${theme.ring} transition hover:shadow-md ${
                        isLastOdd ? "sm:col-span-2" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${theme.icon} text-lg shadow-sm`}
                        >
                          {block.icon}
                        </span>
                        <p className="font-bold text-slate-900">{block.title}</p>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {block.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${theme.icon}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
            {contentHtml && (
              <div
                className="prose prose-slate mt-8 max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            )}
            {overviewBlocks.length === 0 && !contentHtml && (
              <p className="text-slate-500">Descrierea completă urmează în curând.</p>
            )}
          </div>
        )}

        {tab === "curriculum" && (
          <div>
            <p className="text-sm text-slate-500">
              {parts.length} module · {totalVideos} lecții video · {formatDuration(totalSeconds)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Prima lecție din fiecare modul e gratuită — o poți viziona fără să cumperi cursul.
            </p>

            <div className="mt-6 space-y-3">
              {parts.map((part, pIdx) => {
                const open = openPartId === part.id;
                return (
                  <div key={part.id} className="overflow-hidden rounded-2xl border border-slate-200">
                    <button
                      onClick={() => setOpenPartId(open ? null : part.id)}
                      className="flex w-full items-center justify-between gap-3 bg-white px-5 py-4 text-left"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${accentGradient} text-xs font-bold text-white`}
                        >
                          {pIdx + 1}
                        </span>
                        <span>
                          <span className="font-semibold text-slate-900">{part.title}</span>
                          {part.summary && (
                            <span className="block text-sm text-slate-500">{part.summary}</span>
                          )}
                        </span>
                      </span>
                      <span className="flex items-center gap-3 text-sm text-slate-400">
                        {part.videos.length} lecții
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                        >
                          <path
                            d="M6 9l6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    {open && (
                      <ul className="divide-y divide-slate-100 border-t border-slate-100">
                        {part.videos.map((video) => {
                          const unlocked = hasAccess || video.isFreePreview;
                          return (
                            <li key={video.id}>
                              <button
                                disabled={!unlocked}
                                onClick={() => unlocked && setPlayingVideo(video)}
                                className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm transition ${
                                  unlocked ? "hover:bg-slate-50" : "cursor-not-allowed opacity-60"
                                }`}
                              >
                                <span className="flex items-center gap-3">
                                  <span className={unlocked ? accentText : "text-slate-300"}>
                                    {unlocked ? (
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    ) : (
                                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                        <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                                        <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="text-slate-700">{video.title}</span>
                                  {video.isFreePreview && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                      Preview gratuit
                                    </span>
                                  )}
                                </span>
                                {video.durationSec && (
                                  <span className="shrink-0 text-slate-400">{formatVideoTime(video.durationSec)}</span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5">
              <p className="text-4xl font-extrabold text-slate-900">{avgStars.toFixed(1)}</p>
              <div>
                <Stars value={avgStars} />
                <p className="mt-1 text-sm text-slate-500">{reviews.length} recenzii</p>
              </div>
            </div>
            <ul className="mt-6 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{r.authorName}</p>
                    <Stars value={r.stars} />
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {playingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3">
              <p className="font-medium text-white">{playingVideo.title}</p>
              <button
                onClick={() => setPlayingVideo(null)}
                className="text-white/70 hover:text-white"
                aria-label="Închide"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                src={`https://player.vimeo.com/video/${playingVideo.vimeoId}?autoplay=1`}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" fill={i <= Math.round(value) ? "currentColor" : "#e2e8f0"} className="h-4 w-4">
          <path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1z" />
        </svg>
      ))}
    </div>
  );
}
