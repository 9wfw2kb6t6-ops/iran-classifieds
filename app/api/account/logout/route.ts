import { NextResponse } from "next/server";
import { clearUserCookie } from "@/lib/user-auth";
export async function POST() {
  const response = NextResponse.json({ success: true });
  clearUserCookie(response);
  return response;
}