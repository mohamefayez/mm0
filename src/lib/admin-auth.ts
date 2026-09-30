import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getStore, digest, CommerceError } from "./commerce-store";
const derive = promisify(scrypt);
export const sessionCookie = "asel-admin";
export async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await derive(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [salt, expected] = hash.split(":");
  if (!salt || !expected) return false;
  const key = (await derive(password, salt, 64)) as Buffer;
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    key.length === expectedBuffer.length && timingSafeEqual(key, expectedBuffer)
  );
}
export async function isAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return false;
  return Boolean(
    getStore()
      .db.prepare("SELECT token FROM sessions WHERE token=? AND expires>?")
      .get(digest(token), Date.now()),
  );
}
export async function requireAdmin() {
  if (!(await isAdmin())) throw new CommerceError("UNAUTHORIZED", 401);
}
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  const db = getStore().db;
  db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  db.prepare("INSERT INTO sessions VALUES(?,?)").run(
    digest(token),
    Date.now() + 8 * 60 * 60 * 1000,
  );
  return token;
}
