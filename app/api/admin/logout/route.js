import { NextResponse } from "next/server";

export async function POST(req) {

  const response = NextResponse.redirect(
    new URL("/admin/login", req.url),
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