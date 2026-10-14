"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImage } from "@/lib/cropImage";

export default function ImageCropModal({
  imageSrc,
  aspect = 1,
  onCancel,
  onCropped,
}: {
  imageSrc: string;
  aspect?: number;
  onCancel: () => void;
  onCropped: (dataUrl: string) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setPixelCrop(croppedAreaPixels);
  }, []);

  async function handleSave() {
    if (!pixelCrop) return;
    setSaving(true);
    try {
      const dataUrl = await getCroppedImage(imageSrc, pixelCrop);
      onCropped(dataUrl);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl bg-panel p-5 shadow-xl">
        <h3 className="text-lg font-semibold">Crop photo</h3>
        <div className="relative mt-4 h-80 w-full overflow-hidden rounded-xl bg-panel2">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className="mt-4 flex items-center gap-3 text-xs text-muted">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-panel2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !pixelCrop}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : "Use this crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
