import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { AuthenticationFailed } from "troi-library";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { deleteTimeEntry, updateTimeEntry } from "~/troi/troiApiController";

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);

  if (!params.id) {
    throw new Response("entry id required", { status: 400 });
  }

  switch (request.method) {
    case "DELETE":
      try {
        await deleteTimeEntry(session, Number.parseInt(params.id));
      } catch (e) {
        if (e instanceof AuthenticationFailed) {
          throw redirect("/login");
        }

        throw e;
      }

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

      try {
        await updateTimeEntry(
          session,
          Number.parseInt(params.id),
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
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
}
