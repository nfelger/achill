import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { AuthenticationFailed } from "troi-library";
import { getSession, isSessionValid } from "~/sessions.server";
import { addTimeEntry } from "~/troi/troiApiController";

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Response("Method Not Allowed", { status: 405 });
  }

  if (!(await isSessionValid(request))) {
    throw redirect("/login");
  }

  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const body = await request.formData();

  const date = body.get("date");
  if (typeof date !== "string") {
    throw new Response("Missing date", { status: 400 });
  }

  const calculationPositionId = body.get("calculationPositionId");
  if (typeof calculationPositionId !== "string") {
    throw new Response("Missing calculationPositionId", { status: 400 });
  }

  const hours = body.get("hours");
  if (typeof hours !== "string") {
    throw new Response("Missing hours", { status: 400 });
  }

  const description = body.get("description");
  if (typeof description !== "string") {
    throw new Response("Missing description", { status: 400 });
  }

  try {
    await addTimeEntry(
      session,
      parseInt(calculationPositionId, 10),
      date,
      parseFloat(hours),
      description,
    );
  } catch (e) {
    if (e instanceof AuthenticationFailed) {
      throw redirect("/login");
    }

    throw e;
  }

  return new Response(null, { status: 201 });
}
