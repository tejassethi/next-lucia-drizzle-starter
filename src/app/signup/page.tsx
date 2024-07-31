import Link from "next/link";

import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActionResult, Form } from "@/components/form";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/drizzle/database";
import { UserTable } from "@/drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <>
      <h1>Create an account</h1>
      <Form action={signup}>
        <label htmlFor="email">Email</label>
        <input name="email" id="email" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>Continue</button>
      </Form>
      <Link href="/login">Sign in</Link>
    </>
  );
}

async function signup(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const hashPassword = await bcrypt.hash(password, 11);

  const user = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.email, email))
    .get();

  if (user) {
    return { error: "User already exists" };
  }

  const u = await db
    .insert(UserTable)
    .values({
      id: uuidv4(),
      email: email,
      name: "random name",
      password: hashPassword,
    })
    .returning({
      userId: UserTable.id,
    });

  const session = await lucia.createSession(u.at(0)?.userId as string, {});
  const sessionCookie = await lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/");
}
