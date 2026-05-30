"use client";

import { useEffect, useState } from "react";

export function useCoarsePointer(): boolean {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarse(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isCoarse;
}
