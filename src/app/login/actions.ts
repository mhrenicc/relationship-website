"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  isGateConfigured,
  verifyPassword,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  // Checked before reading the password, so a deployment without
  // SITE_PASSWORD says so instead of throwing a blank 500 on submit.
  if (!isGateConfigured()) {
    return {
      error:
        "This deployment has no SITE_PASSWORD set. Add it in the hosting project's environment variables and redeploy.",
    };
  }

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
