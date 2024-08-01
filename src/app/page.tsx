import Link from "next/link";
import { redirect } from "next/navigation";
import { validateRequest } from "../lib/auth";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { H1, H2 } from "@/components/ui/Typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function Home() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/dashboard");
  }
  return (
    <div className="w-full h-screen flex flex-col justify-center place-items-center">
      <Card className="w-96">
        <CardHeader>
          <H2>Home Page</H2>
        </CardHeader>
        <CardContent className="flex justify-center w-fill">
          <Button>
            <Link href="/login">Login </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
