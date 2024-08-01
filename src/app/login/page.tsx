import { ActionResult, Form } from "@/components/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { lucia, validateRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { cookies } from "next/headers";
import { db } from "@/drizzle/database";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateCodeVerifier, generateState } from "arctic";
import { googleOAuthClient } from "@/lib/googleOauth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { H1, H2 } from "@/components/ui/Typography";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <div className="w-full h-screen flex justify-center place-items-center">
      <Card className="w-96">
        <CardHeader>
          <H2>Log in</H2>
        </CardHeader>
        <CardContent>
          <Button className="w-full mb-2">
            <Link href="/login/google">Continue with Google</Link>
          </Button>
          <Form classname="space-y-2" action={login}>
            <Label htmlFor="email">Email</Label>
            <Input name="email" id="email" />
            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" />
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </Form>
          <div className="w-full flex place-items-center justify-between">
            <Button variant="link" className="p-0">
              <Link href="/signup">Create an account</Link>
            </Button>
            <Button variant="link" className="p-0">
              <Link href="/forgot">Forgot Password</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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
