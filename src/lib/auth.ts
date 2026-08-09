import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "site_session";

function getSecret(): string {
  const secret = process.env.SITE_PASSWORD;
  if (!secret) {
    throw new Error("SITE_PASSWORD is not configured");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function verifyPassword(candidate: string): boolean {
  return safeEqual(candidate, getSecret());
}

export function createSessionToken(): string {
  const payload = "authenticated";
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  return safeEqual(sign(payload), signature);
}
