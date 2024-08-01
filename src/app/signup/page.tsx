import Link from "next/link";

import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActionResult, Form } from "@/components/form";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/drizzle/database";
import { UserTable, VerificationTable } from "@/drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { addSeconds, fromUnixTime, getUnixTime, isBefore } from "date-fns";
import { cookies } from "next/headers";
import { date, datetime } from "drizzle-orm/mysql-core";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { H1, H2, H4 } from "@/components/ui/Typography";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resend } from "@/lib/resend";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <div className="w-full h-screen flex justify-center place-items-center">
      <Card className="w-96">
        <CardHeader>
          <H2>Create Account</H2>
        </CardHeader>
        <CardContent>
          <Form classname="space-y-2" action={sendVerfication}>
            <Label htmlFor="email">Email</Label>
            <Input name="email" id="email" />
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

async function sendVerfication(
  _: any,
  formData: FormData
): Promise<ActionResult> {
  "use server";
  const email = formData.get("email") as string;

  const user = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.email, email))
    .get();

  console.log(user);

  if (user) {
    return { error: "User already exists" };
  }

  const verification = await db
    .insert(VerificationTable)
    .values({
      id: uuidv4(),
      email: email,
    })
    .returning({
      verificationID: VerificationTable.id,
    });
  console.log(verification.at(0)?.verificationID);

  const verificationLink = `${process.env.NEXT_PUBLIC_URL}/password/${
    verification.at(0)?.verificationID
  }`;

  const { data, error } = await resend.emails.send({
    from: "Lucia Next <lucianext@resend.dev>",
    to: email,
    subject: "Lucia Next Verification",
    text: `Your verification link is ${verificationLink}`,
  });
  console.log(error);
  console.log(data);
  if (error) return { error: "Please try again later." };
  return { success: "Please check your email to continue." };
}
