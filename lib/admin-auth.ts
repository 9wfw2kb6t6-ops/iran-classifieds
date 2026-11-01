import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

const COOKIE_NAME = "se_sote_admin";
const MAX_AGE = 60 * 60 * 12;
function secret() {
  const value = process.env.ADMIN_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SECRET_NOT_CONFIGURED");
  return value;
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
function verifyToken(token: string) {
  try {
    const [expires, signature, extra] = token.split(".");
    if (!expires || !signature || extra || !/^\d+$/.test(expires)) return false;
    if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
    const expected = Buffer.from(sign(expires));
    const actual = Buffer.from(signature);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}
export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = String(expires);
  return { value: payload + "." + sign(payload), maxAge: MAX_AGE };
}
export function isAdminSessionValid() {
  try {
    const authorization = headers().get("authorization") || "";
    const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearer && verifyToken(bearer)) return true;
    return verifyToken(cookies().get(COOKIE_NAME)?.value || "");
  } catch { return false; }
}
export const adminCookieName = COOKIE_NAME;
