import Link from "next/link";
import { redirect } from "next/navigation";
import { validateRequest } from "../lib/auth";

export default async function Home() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/dashboard");
  }
  return (
    <div className="w-full h-screen flex flex-col justify-center place-items-center">
      <h1 className="text-2xl font-bold text-center p-3">HOME PAGE </h1>
      <Link href="/login" className=" bg-black text-white p-3 rounded-lg">
        Login{" "}
      </Link>
    </div>
  );
}
