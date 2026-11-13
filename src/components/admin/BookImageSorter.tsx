"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

type SorterImage = { id: string; url: string };

export function BookImageSorter({
  bookId,
  images,
  deleteAction,
  reorderAction,
}: {
  bookId: string;
  images: SorterImage[];
  deleteAction: (formData: FormData) => Promise<void>;
  reorderAction: (bookId: string, orderedIds: string[]) => Promise<void>;
}) {
  const [items, setItems] = useState(images);
  const [dragId, setDragId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();
  const itemsRef = useRef(items);
  const startOrderRef = useRef<string>("");

  function updateItems(next: SorterImage[]) {
    itemsRef.current = next;
    setItems(next);
  }

  function handleDragStart(id: string) {
    setDragId(id);
    startOrderRef.current = itemsRef.current.map((i) => i.id).join(",");
    setStatus("idle");
  }

  // Live-reorder while dragging: the dragged image takes the slot of the one it hovers over.
  function handleDragOver(overId: string) {
    if (!dragId || dragId === overId) return;
    const current = itemsRef.current;
    const from = current.findIndex((i) => i.id === dragId);
    const to = current.findIndex((i) => i.id === overId);
    if (from < 0 || to < 0) return;
    const next = current.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateItems(next);
  }

  function handleDragEnd() {
    setDragId(null);
    const order = itemsRef.current.map((i) => i.id);
    if (order.join(",") === startOrderRef.current) return;
    setStatus("saving");
    startTransition(async () => {
      try {
        await reorderAction(bookId, order);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <div>
      {items.length > 1 && (
        <p className="mt-1 text-xs text-slate-500">
          Trage o imagine în locul unde vrei să apară. Prima imagine este cea afișată prima pe pagina cărții.
          {status === "saving" && <span className="ml-2 text-slate-400">Se salvează…</span>}
          {status === "saved" && <span className="ml-2 text-emerald-600">Ordinea a fost salvată.</span>}
          {status === "error" && (
            <span className="ml-2 text-rose-600">Nu s-a putut salva ordinea — reîncarcă pagina și încearcă din nou.</span>
          )}
        </p>
      )}
      <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-5">
        {items.map((img, index) => (
          <div
            key={img.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", img.id);
              handleDragStart(img.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              handleDragOver(img.id);
            }}
            onDrop={(e) => e.preventDefault()}
            onDragEnd={handleDragEnd}
            className={`space-y-2 ${dragId === img.id ? "opacity-40" : ""}`}
          >
            <div className="relative aspect-[3/4] cursor-grab overflow-hidden rounded-lg bg-slate-100 active:cursor-grabbing">
              <Image
                src={img.url}
                alt=""
                width={160}
                height={213}
                draggable={false}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-slate-900/70 px-2 py-0.5 text-xs font-semibold text-white">
                {index + 1}
              </span>
            </div>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={img.id} />
              <input type="hidden" name="bookId" value={bookId} />
              <button className="w-full text-center text-xs text-rose-600 hover:underline">Șterge</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
