import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { initPixel, trackWebEvent } from "@/lib/fbpixel";

/**
 * Inicializa o Meta Pixel e dispara PageView apenas em mudança real de rota
 * (pathname + search). Mudanças de hash (#contato) são ignoradas.
 */
export function MetaPixelProvider() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const search = useLocation({ select: (l) => l.searchStr });
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    initPixel();
    lastPathRef.current = `${pathname}${search ?? ""}`;
    trackWebEvent("PageView");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const current = `${pathname}${search ?? ""}`;
    if (lastPathRef.current === null || lastPathRef.current === current) return;
    lastPathRef.current = current;
    trackWebEvent("PageView");
  }, [pathname, search]);

  return null;
}

export default MetaPixelProvider;
