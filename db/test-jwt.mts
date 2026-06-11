import { signAccessToken, verifyAccessToken } from "../src/lib/jwt.ts";

const token = await signAccessToken({
  sub: "test-user-id",
  email: "admin@yairink.com",
  name: "Yair I.",
  role: "DIRECTOR CREATIVO",
});

const payload = await verifyAccessToken(token);

if (!payload || payload.sub !== "test-user-id") {
  console.error("JWT FALLIDO");
  process.exit(1);
}

console.log("JWT OK");
console.log(`  sub:   ${payload.sub}`);
console.log(`  email: ${payload.email}`);
console.log(`  role:  ${payload.role}`);
