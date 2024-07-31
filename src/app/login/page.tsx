import { ActionResult, Form } from "@/components/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { lucia, validateRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";

import { cookies } from "next/headers";
import { db } from "@/drizzle/database";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateCodeVerifier, generateState } from "arctic";
import { googleOAuthClient } from "@/lib/googleOauth";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <>
      <h1>Sign in</h1>
      <Link href="/login/google">Continue with Google</Link>
      <Form action={login}>
        <label htmlFor="email">Email</label>
        <input name="email" id="email" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>Continue</button>
      </Form>
      <Link href="/signup">Create an account</Link>
    </>
  );
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const existingUser = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.email, email as string))
    .get();

  if (!existingUser) {
    return {
      error: "Incorrect username or password",
    };
  }

  if (!existingUser.password) {
    return {
      error: "Please sign in with your provider.",
    };
  }

  const match = await bcrypt.compare(password, existingUser.password as string);
  if (!match) {
    return {
      error: "Incorrect username or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/dashboard");
}
