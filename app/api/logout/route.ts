// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    expires: new Date(0), // invalidate
    path: "/",
  });

  return NextResponse.json({ message: "Logged out" });
}
