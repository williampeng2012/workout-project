import Image from "next/image";
import { ViewTransition } from "react";
import { cn } from "@/lib/cn";

/**
 * Photography block: object-cover image with optional scrim and shared
 * view-transition name (for card → detail morphs).
 */
export function Media({
  src,
  alt,
  sizes = "100vw",
  priority,
  className,
  imgClassName,
  scrim,
  zoom,
  vtName,
  position,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  scrim?: "bottom" | "left" | "full" | "none";
  zoom?: boolean;
  vtName?: string;
  position?: string;
}) {
  const img = (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", imgClassName)}
      style={position ? { objectPosition: position } : undefined}
    />
  );

  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? "");

  return (
    <div className={cn(!positioned && "relative", "overflow-hidden bg-surface-2", zoom && "media-zoom", className)}>
      {vtName ? (
        <ViewTransition name={vtName} share="morph" default="none">
          <div className="absolute inset-0">{img}</div>
        </ViewTransition>
      ) : (
        img
      )}
      {scrim === "bottom" && <div className="scrim-bottom pointer-events-none absolute inset-0" />}
      {scrim === "left" && <div className="scrim-left pointer-events-none absolute inset-0" />}
      {scrim === "full" && <div className="pointer-events-none absolute inset-0 bg-ink/55" />}
    </div>
  );
}
