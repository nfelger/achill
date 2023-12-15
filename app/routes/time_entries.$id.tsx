import { ActionFunctionArgs } from "@remix-run/node";
import { deleteTimeEntry, updateTimeEntry } from "~/troi/troiApiController";

export async function action({ request, params }: ActionFunctionArgs) {
  if (!params.id) {
    throw new Response("entry id required", { status: 400 });
  }

  switch (request.method) {
    case "DELETE":
      await deleteTimeEntry(request, Number.parseInt(params.id));
      return new Response(null, { status: 204 });
    case "PUT":
      const body = await request.formData();

      const hours = body.get("hours");
      if (typeof hours !== "string") {
        throw new Response("Missing hours", { status: 400 });
      }

      const description = body.get("description");
      if (typeof description !== "string") {
        throw new Response("Missing description", { status: 400 });
      }

      await updateTimeEntry(
        request,
        Number.parseInt(params.id),
        parseFloat(hours),
        description,
      );

      return new Response(null, { status: 201 });
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
}
