"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SESSION_IDLE_TIMEOUT } from "@/lib/auth-constants";

const IDLE_MS = SESSION_IDLE_TIMEOUT * 1000;
const REFRESH_DEBOUNCE_MS = 60 * 1000;
const MOVE_THROTTLE_MS = 5000;

export default function SessionIdleGuard() {
  const router = useRouter();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshRef = useRef(0);
  const lastMoveRef = useRef(0);
  const loggingOutRef = useRef(false);

  const logout = useCallback(
    async (reason: "idle" | "expired") => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;

      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }

      const message =
        reason === "idle"
          ? "Sesión cerrada por inactividad (30 minutos)."
          : "Tu sesión ha expirado.";

      toast.message(message);
      router.replace(`/admin/login?reason=${reason}`);
    },
    [router]
  );

  const refreshSession = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_DEBOUNCE_MS) return;
    lastRefreshRef.current = now;

    try {
      const response = await fetch("/api/auth/refresh", { method: "POST" });
      if (response.status === 401) {
        await logout("expired");
      }
    } catch {
      /* ignore transient network errors */
    }
  }, [logout]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      void logout("idle");
    }, IDLE_MS);
  }, [logout]);

  const onActivity = useCallback(() => {
    resetIdleTimer();
    void refreshSession();
  }, [resetIdleTimer, refreshSession]);

  useEffect(() => {
    resetIdleTimer();
    void refreshSession();

    const onKeyOrClick = () => onActivity();
    const onScroll = () => onActivity();
    const onMove = () => {
      const now = Date.now();
      if (now - lastMoveRef.current < MOVE_THROTTLE_MS) return;
      lastMoveRef.current = now;
      onActivity();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        onActivity();
      }
    };

    window.addEventListener("mousedown", onKeyOrClick, { passive: true });
    window.addEventListener("keydown", onKeyOrClick, { passive: true });
    window.addEventListener("touchstart", onKeyOrClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousedown", onKeyOrClick);
      window.removeEventListener("keydown", onKeyOrClick);
      window.removeEventListener("touchstart", onKeyOrClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [onActivity, refreshSession, resetIdleTimer]);

  return null;
}
