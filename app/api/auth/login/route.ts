import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" } // 15 minutes
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key",
      { expiresIn: "7d" } // 7 days
    );

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    // Get the domain from request headers
    const domain = req.headers.get("host")?.split(":")[0] || "localhost";

    // Set token cookie with more permissive settings for EC2
    response.cookies.set({
      name: "token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only true in production
      sameSite: "lax", // Changed from strict to lax
      path: "/",
      domain: domain, // Set domain dynamically
      maxAge: 86400, // 1 day
    });

    // Set CSRF token cookie
    response.cookies.set({
      name: "csrf-token",
      value: nanoid(), // Make sure to import nanoid
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: domain,
      maxAge: 86400,
    });

    // Set refresh token cookie
    response.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 604800, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
