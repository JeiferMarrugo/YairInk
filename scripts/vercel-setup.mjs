#!/usr/bin/env node
/**
 * Imprime variables y pasos para desplegar YairInk en Vercel.
 * No modifica archivos ni sube secretos a ningún sitio.
 *
 * Usage: npm run vercel:setup
 */

import crypto from "node:crypto";

function secret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

const jwtSecret = secret(48);
const cronSecret = secret(24);

const env = {
  DATABASE_URL: "postgresql://USER:PASS@HOST/DB?sslmode=require",
  JWT_SECRET: jwtSecret,
  CRON_SECRET: cronSecret,
  NEXT_PUBLIC_APP_URL: "https://tu-proyecto.vercel.app",
  WHATSAPP_ENABLED: "false",
  ADMIN_EMAIL: "admin@yairink.com",
  ADMIN_PASSWORD: "(solo para npm run db:seed local contra prod)",
  ARTIST_NOTIFY_PHONE: "573001234567",
  RESEND_API_KEY: "(opcional)",
  STUDIO_EMAIL: "hola@yairink.com",
  RESEND_FROM_EMAIL: "YAIRINK <hola@yairink.com>",
  OPENWA_API_URL: "(después del VPS) https://wa-api.tudominio.com/api",
  OPENWA_API_KEY: "(después del VPS)",
  OPENWA_SESSION_ID: "(después del VPS)",
};

console.log(`
=== YairInk → Vercel ===

1) Base de datos (Neon recomendado)
   - https://neon.tech → New Project → copia DATABASE_URL
   - Debe incluir sslmode=require

2) Migraciones (una vez, desde tu PC)
   $env:DATABASE_URL="postgresql://..."
   npm run db:migrate
   npm run db:seed
   npm run db:seed-content

3) Vercel — importar repo
   - https://vercel.com/new → GitHub → JeiferMarrugo/YairInk
   - Framework: Next.js (auto)
   - Root: ./
   - Build: npm run build
   - Install: npm install

4) Variables de entorno en Vercel (Settings → Environment Variables)
   Pega cada una en Production (+ Preview si quieres):

`);

for (const [key, value] of Object.entries(env)) {
  console.log(`${key}=${value}`);
}

console.log(`
5) Deploy
   - Vercel despliega solo al hacer push a main
   - O desde CLI: npm run vercel:link (primera vez) → npm run vercel:deploy

6) Cron de recordatorios
   - vercel.json: 1 vez al día (9:00 AM Colombia / 14:00 UTC) — plan Hobby
   - Para cada 10 min necesitas Vercel Pro y schedule "*/10 * * * *"
   - CRON_SECRET debe coincidir con la variable de entorno

7) WhatsApp (OpenWA)
   - NO va en Vercel. Déjalo con WHATSAPP_ENABLED=false hasta tener VPS.
   - Luego apunta OPENWA_API_URL a tu servidor Docker.

8) Subidas de fotos
   - public/uploads no persiste en Vercel. Usa la app; luego migramos a Blob/S3.

Secretos generados arriba (JWT_SECRET, CRON_SECRET): guárdalos; no se vuelven a mostrar.
`);
