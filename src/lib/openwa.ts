export function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) throw new Error("Número de teléfono inválido.");
  return `${digits}@c.us`;
}

type OpenWaConfig = {
  apiUrl: string;
  apiKey: string;
  sessionId: string;
};

function getOpenWaConfig(): OpenWaConfig | null {
  const enabled = process.env.WHATSAPP_ENABLED === "true";
  const apiUrl = process.env.OPENWA_API_URL;
  const apiKey = process.env.OPENWA_API_KEY;
  const sessionId = process.env.OPENWA_SESSION_ID;

  if (!enabled || !apiUrl || !apiKey || !sessionId) return null;

  return {
    apiUrl: apiUrl.replace(/\/$/, ""),
    apiKey,
    sessionId,
  };
}

function openWaHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
  };
}

export function isOpenWaConfigured(): boolean {
  return getOpenWaConfig() !== null;
}

type SessionData = {
  id?: string;
  name?: string;
  status?: string;
  phone?: string;
  phoneNumber?: string;
};

function isSessionConnected(status?: string): boolean {
  const normalized = String(status || "").toUpperCase();
  return normalized === "CONNECTED" || normalized === "READY";
}

export async function getOpenWaStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  sessionId?: string;
  sessionStatus?: string;
  phoneNumber?: string;
  error?: string;
}> {
  const config = getOpenWaConfig();
  if (!config) {
    return { configured: false, connected: false };
  }

  try {
    const healthRes = await fetch(`${config.apiUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!healthRes.ok) {
      return {
        configured: true,
        connected: false,
        sessionId: config.sessionId,
        error: "OpenWA no responde. ¿Está corriendo Docker?",
      };
    }

    const sessionRes = await fetch(
      `${config.apiUrl}/sessions/${config.sessionId}`,
      {
        headers: openWaHeaders(config.apiKey),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!sessionRes.ok) {
      return {
        configured: true,
        connected: false,
        sessionId: config.sessionId,
        error:
          sessionRes.status === 404
            ? "Sesión no encontrada. Créala en el dashboard (localhost:2886)."
            : "No se pudo consultar el estado de la sesión.",
      };
    }

    const body = (await sessionRes.json()) as {
      success?: boolean;
      data?: SessionData;
    };
    const session = body.data;
    const status = session?.status ?? "UNKNOWN";

    return {
      configured: true,
      connected: isSessionConnected(status),
      sessionId: session?.id ?? config.sessionId,
      sessionStatus: status,
      phoneNumber: session?.phoneNumber ?? session?.phone,
      error: isSessionConnected(status)
        ? undefined
        : ["SCAN_QR", "QR_READY"].includes(String(status).toUpperCase())
          ? "Escanea el QR en el dashboard de OpenWA."
          : `Estado de sesión: ${status}`,
    };
  } catch {
    return {
      configured: true,
      connected: false,
      sessionId: config.sessionId,
      error:
        "No se pudo conectar con OpenWA. Ejecuta: docker compose up -d en el repo OpenWA.",
    };
  }
}

export async function sendTextViaOpenWA(
  phone: string,
  content: string
): Promise<{ messageId: string }> {
  const config = getOpenWaConfig();
  if (!config) {
    throw new Error("OpenWA no está configurado.");
  }

  const chatId = phoneToChatId(phone);
  const response = await fetch(
    `${config.apiUrl}/sessions/${config.sessionId}/messages/send-text`,
    {
      method: "POST",
      headers: openWaHeaders(config.apiKey),
      body: JSON.stringify({ chatId, text: content }),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Error al enviar mensaje por OpenWA.");
  }

  const result = (await response.json()) as {
    success?: boolean;
    data?: { messageId?: string };
    messageId?: string;
  };

  const messageId =
    result.data?.messageId ?? result.messageId ?? "sent";

  return { messageId: String(messageId) };
}
