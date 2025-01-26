import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function GET() {
  const csrfToken = nanoid();

  const response = NextResponse.json({ csrfToken });

  response.cookies.set({
    name: "csrf-token",
    value: csrfToken,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return response;
}
