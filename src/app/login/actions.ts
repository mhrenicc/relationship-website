"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, verifyPassword, SESSION_COOKIE_NAME } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return { error: "Enter the password." };
  }

  if (!verifyPassword(password)) {
    return { error: "That's not it — try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });

  redirect("/");
}
