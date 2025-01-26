import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("refresh_token");

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const decoded = jwt.verify(
      refreshToken.value,
      process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key"
    ) as { userId: string };

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );

    const response = NextResponse.json({ message: "Token refreshed" });

    response.cookies.set({
      name: "token",
      value: newAccessToken,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 900,
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }
}
