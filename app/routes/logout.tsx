import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/sessions";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const headers = new Headers();
  headers.append("Set-Cookie", await destroySession(session));

  return redirect("/login", {
    headers,
  });
}
