import Link from "next/link";

import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActionResult, Form } from "@/components/form";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/drizzle/database";
import { UserTable, VerificationTable } from "@/drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { useRouter } from "next/router";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { H2 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";

export default async function Page({ params }: { params: { id: string } }) {
  console.log(params.id);
  if (!params.id) {
    return redirect("/login");
  }
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  const email = await getVerifiedEmail(params.id);
  return (
    <div className="w-full h-screen flex justify-center place-items-center">
      <Card className="w-96">
        <CardHeader>
          <H2>Set Password</H2>
        </CardHeader>
        <CardContent>
          <Form classname="space-y-2" action={signup}>
            <Input type="hidden" name="email" id="email" value={email} />
            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" />
            <Label htmlFor="confirmpassword">Confirm Password</Label>
            <Input
              type="password"
              name="confirmpassword"
              id="confirmpassword"
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>{" "}
          </Form>
          <div className="w-full flex place-items-center justify-between">
            <Button variant="link" className="p-0">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function getVerifiedEmail(verificationID: string) {
  if (!verificationID) {
    redirect("/login");
  }

  const verified = await db
    .select()
    .from(VerificationTable)
    .where(eq(VerificationTable.id, verificationID))
    .get();

  await db
    .delete(VerificationTable)
    .where(eq(VerificationTable.id, verificationID));

  if (
    !verified ||
    Math.floor(verified.expiresAt.getTime() / 1000) <
      Math.floor(Date.now() / 1000) - 600
  ) {
    return redirect("/");
  } else {
    return verified.email;
  }
}

async function signup(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const hashPassword = await bcrypt.hash(password, 11);

  console.log(email);

  const user = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.email, email))
    .get();

  if (!user) {
    const u = await db
      .insert(UserTable)
      .values({
        id: uuidv4(),
        email: email,
        name: "",
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
  } else {
    await db
      .update(UserTable)
      .set({
        password: hashPassword,
      })
      .where(eq(UserTable.email, email));

    const session = await lucia.createSession(user.id as string, {});
    const sessionCookie = await lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  return redirect("/");
}
