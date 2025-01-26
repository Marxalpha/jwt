import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };

    // If token is valid, return some dummy data
    return NextResponse.json({
      message: "This is a protected dummy API response",
      data: {
        timestamp: new Date().toISOString(),
        randomNumber: Math.floor(Math.random() * 1000),
        userId: decoded.userId,
      },
    });
  } catch (error) {
    console.error("Dummy API error:", error);
    return NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }
}
