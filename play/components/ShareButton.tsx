"use client";

import { useEffect, useRef, useState } from "react";
import { shareCopy } from "@/lib/share";

async function fileFromDataUrl(dataUrl: string, name = "photo.jpg"): Promise<File | null> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const type = blob.type || "image/jpeg";
    const ext = type.split("/")[1] || "jpg";
    return new File([blob], name.includes(".") ? name : `photo.${ext}`, { type });
  } catch {
    return null;
  }
}

export function ShareButton({
  title,
  body,
  path,
  imageDataUrl,
  className = "btn sm",
}: {
  title?: string;
  body: string;
  path: string;
  imageDataUrl?: string;
  className?: string;
}) {
  const copy = shareCopy(body, path);
  const [open, setOpen] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function nativeShare() {
    const payload: ShareData = { title: title || copy.title, text: copy.text, url: copy.url };
    let file: File | null = null;
    if (imageDataUrl) file = await fileFromDataUrl(imageDataUrl);
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ ...payload, files: [file] });
        return;
      }
      await navigator.share(payload);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setOpen(true);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(copy.url);
    } catch {
      const box = document.createElement("textarea");
      box.value = copy.url;
      document.body.appendChild(box);
      box.select();
      document.execCommand("copy");
      box.remove();
    }
    setOpen(false);
  }

  const encodedText = encodeURIComponent(copy.text);
  const encodedUrl = encodeURIComponent(copy.url);
  const encodedTitle = encodeURIComponent(title || copy.title);
  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedText}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedText}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
    { label: "Email", href: `mailto:?subject=${encodedTitle}&body=${encodedText}` },
  ];

  return (
    <div className="share" ref={root}>
      <button
        className={className}
        type="button"
        onClick={() => {
          if (canNative) void nativeShare();
          else setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Share
      </button>
      {canNative ? (
        <button className="btn sm share-more" type="button" onClick={() => setOpen((v) => !v)}>
          More
        </button>
      ) : null}
      {open ? (
        <div className="share-menu" role="menu">
          {links.map((item) => (
            <a
              key={item.label}
              role="menuitem"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <button type="button" role="menuitem" onClick={() => void copyLink()}>
            Copy link
          </button>
        </div>
      ) : null}
    </div>
  );
}
