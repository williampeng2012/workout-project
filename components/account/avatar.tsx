"use client";

import { Camera, ImageUp, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";
import { initialsOf } from "./ui";

const AVATAR_PX = 256;
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/** Photo if set, otherwise initials. Size and type scale come from `className`. */
export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper font-display font-extrabold text-ink [font-stretch:80%]",
        className,
      )}
      aria-hidden
    >
      {src ? <Image src={src} alt="" fill unoptimized className="object-cover" /> : initialsOf(name)}
    </span>
  );
}

/** Center-crops to a square and downsizes so the result fits comfortably in localStorage. */
async function toAvatarDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    img.src = url;
    await img.decode();
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_PX;
    canvas.height = AVATAR_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, AVATAR_PX, AVATAR_PX);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      img,
      (img.naturalWidth - side) / 2,
      (img.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_PX,
      AVATAR_PX,
    );
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Tappable avatar with a camera badge; opens a sheet to upload or remove the photo. */
export function AvatarPicker({ name, className }: { name: string; className?: string }) {
  const { state, updateAvatar } = usePulse();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Choose an image file", "info");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast("That photo is too large — try one under 15 MB", "info");
      return;
    }
    setBusy(true);
    try {
      updateAvatar(await toAvatarDataUrl(file));
      setOpen(false);
      toast("Profile photo updated");
    } catch {
      toast("Couldn't read that photo — try a JPG or PNG", "info");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Change profile photo"
        className="group pressable relative shrink-0 rounded-full"
      >
        <Avatar name={name} src={state.avatar} className={className} />
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-1 bg-accent text-accent-ink transition-transform duration-300 group-hover:scale-110"
          aria-hidden
        >
          <Camera size={13} strokeWidth={2.4} />
        </span>
      </button>

      <input ref={inputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={onFile} />

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Profile photo"
        description="Shown on your profile and in the sidebar. Saved on this device."
      >
        <div className="flex flex-col items-center">
          <Avatar name={name} src={state.avatar} className="h-28 w-28 text-[40px]" />
          <div className="mt-6 flex w-full flex-col gap-2.5">
            <Button
              block
              loading={busy}
              icon={<ImageUp size={16} aria-hidden />}
              onClick={() => inputRef.current?.click()}
            >
              {state.avatar ? "Choose a new photo" : "Upload a photo"}
            </Button>
            {state.avatar && (
              <Button
                block
                variant="ghost"
                disabled={busy}
                icon={<Trash2 size={16} aria-hidden />}
                onClick={() => {
                  updateAvatar(null);
                  setOpen(false);
                  toast("Profile photo removed");
                }}
              >
                Remove photo
              </Button>
            )}
          </div>
        </div>
      </Sheet>
    </>
  );
}
