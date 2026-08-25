"use client";

import { useState } from "react";
import type { ColorStock } from "@/lib/db";

const KOFI_URL = "https://ko-fi.com/echo3d";
const CUSTOM_COLOR_EMAIL = "custom@echoprints.xyz";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Swatch({
  color,
  selected,
  onSelect,
}: {
  color: ColorStock;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`card-glow overflow-hidden rounded-2xl bg-panel text-left ring-2 transition ${
        selected ? "ring-accent" : "ring-transparent hover:-translate-y-0.5"
      }`}
    >
      <div
        className="relative aspect-square"
        style={
          color.photo_data_url
            ? { backgroundImage: `url(${color.photo_data_url})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(135deg, ${color.hex_primary} 0%, ${color.hex_secondary} 100%)` }
        }
      >
        {!color.photo_data_url && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.15) 100%)",
            }}
          />
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
            color.in_stock ? "bg-white/85 text-emerald-700" : "bg-white/85 text-rose-700"
          }`}
        >
          {color.in_stock ? "Available now" : "Currently unavailable"}
        </span>
        {selected && (
          <span className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">
            <CheckIcon />
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{color.name}</h3>
        {color.material && <p className="mt-0.5 text-xs text-muted">{color.material}</p>}
      </div>
    </button>
  );
}

export default function ColorPicker({ colors }: { colors: ColorStock[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = colors.find((c) => c.id === selectedId) ?? null;

  const mailtoHref = `mailto:${CUSTOM_COLOR_EMAIL}?subject=${encodeURIComponent(
    "Custom color request"
  )}&body=${encodeURIComponent("Hi Echo Prints,\n\nI'd like to request a custom color:\n\n")}`;

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => (
          <Swatch
            key={color.id}
            color={color}
            selected={color.id === selectedId}
            onSelect={() => setSelectedId((prev) => (prev === color.id ? null : color.id))}
          />
        ))}
        {colors.length === 0 && (
          <p className="text-muted">No colors listed yet &mdash; check back soon.</p>
        )}
      </div>

      <div className="mt-8">
        {selected ? (
          <div className="card-glow flex flex-col items-center gap-4 rounded-2xl border border-hairline bg-panel p-5 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 shrink-0 rounded-full"
                style={
                  selected.photo_data_url
                    ? { backgroundImage: `url(${selected.photo_data_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: `linear-gradient(135deg, ${selected.hex_primary} 0%, ${selected.hex_secondary} 100%)` }
                }
              />
              <div>
                <p className="text-xs text-muted">Selected color</p>
                <p className="font-semibold">{selected.name}</p>
              </div>
            </div>
            {selected.in_stock ? (
              <a
                href={KOFI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full bg-accent px-6 py-2.5 text-center font-semibold text-white transition hover:bg-accent-dark"
              >
                Go to Shop &mdash; mention &ldquo;{selected.name}&rdquo;
              </a>
            ) : (
              <a
                href={mailtoHref}
                className="shrink-0 rounded-full border border-hairline px-6 py-2.5 text-center font-semibold text-ink transition hover:bg-panel2"
              >
                Ask About This Color
              </a>
            )}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-hairline bg-panel/60 p-4 text-center text-sm text-muted">
            Tap a color above to select it.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-hairline p-6 text-center">
        <h3 className="font-semibold">Don&apos;t see the color you want?</h3>
        <p className="mt-1 text-sm text-muted">
          Request a custom color and we&apos;ll see what we can do.
        </p>
        <a
          href={mailtoHref}
          className="mt-4 inline-block rounded-full border border-hairline px-6 py-2.5 font-semibold text-ink transition hover:bg-panel2"
        >
          Request a Custom Color
        </a>
      </div>
    </div>
  );
}
