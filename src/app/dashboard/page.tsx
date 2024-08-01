import { ActionResult, Form } from "@/components/form";
import { Button } from "@/components/ui/button";
import { lucia, validateRequest } from "@/lib/auth";
import { User } from "lucia";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full h-screen flex justify-center place-items-center">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 border p-4 rounded-lg bg-gray-100 transition-all cursor-pointer hover:shadow-xl">
          <div className="flex flex-col">
            <span className="font-semibold text-xl">{user.email}</span>
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-4">
        <Form action={logout}>
          <Button>Sign out</Button>
        </Form>{" "}
      </div>
    </div>
  );
}

async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/login");
}
