import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "default_secret"; // Replace with a secure value in production

// POST: Login handler
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json(); // Parse the request body

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectMongoDB();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Create a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with the token
    return NextResponse.json({
      message: "Login successful.", 
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login.", error: error.message },
      { status: 500 }
    );
  }
}