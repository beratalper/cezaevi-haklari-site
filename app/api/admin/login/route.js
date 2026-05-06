import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const password = formData.get("password");
    const next = formData.get("next") || "/admin";

    if (
      !password ||
      password !== process.env.ADMIN_SECRET
    ) {
      return new NextResponse("Hatalı şifre", {
        status: 401,
      });
    }

    const response = NextResponse.redirect(
      new URL(next, req.url)
    );

    response.cookies.set("admin_auth", password, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error(error);

    return new NextResponse("Login failed", {
      status: 500,
    });
  }
}