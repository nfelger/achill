import { ActionFunctionArgs, json } from "@remix-run/node";
import { getSession } from "~/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();

  return json([...formData.entries()]);
}
