// route.ts for REGISTER

// app/api/register/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  await dbConnect();

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

  return NextResponse.json({ message: "User registered successfully" });
}
