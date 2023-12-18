import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { isSessionValid } from "~/sessions";
import { addTimeEntry } from "~/troi/troiApiController";

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Response("Method Not Allowed", { status: 405 });
  }

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

  if (!(await isSessionValid(request))) {
    throw redirect("/login");
  }

  await addTimeEntry(
    request,
    parseInt(calculationPositionId, 10),
    date,
    parseFloat(hours),
    description,
  );

  return new Response(null, { status: 201 });
}
