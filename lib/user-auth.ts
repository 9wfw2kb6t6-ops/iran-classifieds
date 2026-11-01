import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { NextRequest, NextResponse } from "next/server";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "se_sote_user";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.USER_SESSION_SECRET || process.env.ADMIN_SECRET;
  if (!value || value.length < 32) throw new Error("USER_SESSION_SECRET_NOT_CONFIGURED");
  return value;
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
function verifySessionToken(token: string): number | null {
  try {
    const [id, expires, signature, extra] = token.split(".");
    if (!id || !expires || !signature || extra || !/^\d+$/.test(id) || !/^\d+$/.test(expires)) return null;
    if (Number(expires) <= Math.floor(Date.now() / 1000)) return null;
    const expected = Buffer.from(sign(id + "." + expires));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const userId = Number(id);
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  } catch { return null; }
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return salt + ":" + derived.toString("hex");
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || !/^[a-f0-9]{128}$/i.test(hash)) return false;
  const derived = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
export function createUserSession(userId: number) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = userId + "." + expires;
  return { value: payload + "." + sign(payload), maxAge: MAX_AGE };
}
export function getUserIdFromRequest(request: NextRequest): number | null {
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearer) {
    const userId = verifySessionToken(bearer);
    if (userId) return userId;
  }
  return verifySessionToken(request.cookies.get(COOKIE_NAME)?.value || "");
}
export function setUserCookie(response: NextResponse, value: string, maxAge: number) {
  response.cookies.set(COOKIE_NAME, value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge });
}
export function clearUserCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
export const userCookieName = COOKIE_NAME;
