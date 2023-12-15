import { ActionFunctionArgs } from "@remix-run/node";
import { deleteTimeEntry } from "~/troi/troiControllerServer";

export async function action({ request, params }: ActionFunctionArgs) {
  if (!params.id) {
    throw new Response("entry id required", { status: 400 });
  }

  // todo (Malte Laukötter, 2023-12-15): check auth

  await deleteTimeEntry(request, Number.parseInt(params.id));
  return new Response(null, { status: 204 });
}
