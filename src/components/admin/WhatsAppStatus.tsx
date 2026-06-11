"use client";

import { useEffect, useState } from "react";

type WaStatus = {
  configured: boolean;
  connected: boolean;
  sessionId?: string;
  sessionStatus?: string;
  phoneNumber?: string;
  error?: string;
};

export default function WhatsAppStatus() {
  const [status, setStatus] = useState<WaStatus | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/whatsapp/status");
        if (res.ok) setStatus(await res.json());
      } catch {
        setStatus({
          configured: false,
          connected: false,
          error: "Error de conexión",
        });
      }
    }
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  if (!status.configured) {
    return (
      <div className="border border-black/10 bg-white px-4 py-3 text-xs text-black/50">
        OpenWA no configurado — los envíos usarán enlaces wa.me
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 border px-4 py-3 text-xs ${
        status.connected
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          status.connected ? "bg-green-500" : "bg-amber-500"
        }`}
      />
      <div>
        <p className="font-medium">
          {status.connected
            ? `WhatsApp conectado${status.phoneNumber ? ` · +${status.phoneNumber}` : ""}`
            : "WhatsApp desconectado"}
        </p>
        {status.sessionId && (
          <p className="mt-0.5 text-[10px] opacity-70">
            Sesión: {status.sessionId}
            {status.sessionStatus ? ` (${status.sessionStatus})` : ""}
          </p>
        )}
        {status.error && (
          <p className="mt-0.5 text-[10px] opacity-80">{status.error}</p>
        )}
        {!status.connected && (
          <p className="mt-0.5 text-[10px] opacity-80">
            Dashboard:{" "}
            <a
              href="http://localhost:2886"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              localhost:2886
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
