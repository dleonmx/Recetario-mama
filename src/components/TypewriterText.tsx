"use client";

import { useEffect, useState } from "react";

export function TypewriterText({
  text,
  speedMs = 28,
  className,
}: {
  text: string;
  speedMs?: number;
  className?: string;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);

  const done = shown.length === text.length;

  return (
    <p className={className}>
      {shown}
      <span className={done ? "animate-pulse" : "opacity-0"}>▍</span>
    </p>
  );
}
