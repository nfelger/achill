import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { login } from "~/cookies.server";

export async function action({}: ActionFunctionArgs) {
  return redirect("/login", {
    headers: {
      "Set-Cookie": await login.serialize({}, { maxAge: 1 }),
    },
  });
}
