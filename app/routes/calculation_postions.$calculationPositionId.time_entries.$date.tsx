import { ActionFunctionArgs } from "@remix-run/node";
import { addTimeEntry } from "~/troi/troiControllerServer";

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Response("Method Not Allowed", { status: 405 });
  }

  // todo (Malte Laukötter, 2023-12-15): check auth

  if (params.calculationPositionId === undefined) {
    throw new Response("Missing calculationPositionId", { status: 400 });
  }

  if (params.date === undefined) {
    throw new Response("Missing date", { status: 400 });
  }

  const body = await request.formData();

  const hours = body.get("hours");
  if (typeof hours !== "string") {
    throw new Response("Missing hours", { status: 400 });
  }

  const description = body.get("description");
  if (typeof description !== "string") {
    throw new Response("Missing description", { status: 400 });
  }

  await addTimeEntry(
    request,
    parseInt(params.calculationPositionId, 10),
    params.date,
    parseFloat(hours),
    description,
  );

  return new Response(null, { status: 201 });
}
