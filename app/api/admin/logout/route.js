import { NextResponse } from "next/server";

export async function POST() {

  const response = NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    {
      status: 303,
    }
  );

  response.cookies.set("admin_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}