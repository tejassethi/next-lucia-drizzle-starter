import { googleOAuthClient } from "@/lib/googleOauth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  cookies().set("state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  cookies().set("codeVerifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  console.log("state:", state);
  console.log("codeVerifier:", codeVerifier);

  const authUrl = await googleOAuthClient.createAuthorizationURL(
    state,
    codeVerifier,
    {
      scopes: ["email", "profile"],
    }
  );

  return Response.redirect(authUrl);
}
