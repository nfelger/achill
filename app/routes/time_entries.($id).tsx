import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { AuthenticationFailed } from "troi-library";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import {
  addTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
} from "~/troi/troiApiController";

function checkIDOrThrow(
  ID: string | undefined,
): asserts ID is NonNullable<string> {
  if (ID === undefined) {
    throw new Response("Entry ID is required.", { status: 400 });
  }
}

function getFromFormDataOrThrow(formData: FormData, keys: string[]): string[] {
  return keys.map((key) => {
    const value = formData.get(key);
    if (typeof value !== "string") {
      throw new Response(`Missing ${key}`, { status: 400 });
    }
    return value;
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);
  const body = await request.formData();
  let date, hours, description, calculationPositionId;

  try {
    switch (request.method) {
      case "POST":
        [date, hours, description, calculationPositionId] =
          getFromFormDataOrThrow(body, [
            "date",
            "hours",
            "description",
            "calculationPositionId",
          ]);

        await addTimeEntry(
          session,
          parseInt(calculationPositionId, 10),
          date,
          parseFloat(hours),
          description,
        );

        return new Response(null, { status: 201 });
      case "PUT":
        checkIDOrThrow(params.id);
        [hours, description] = getFromFormDataOrThrow(body, [
          "hours",
          "description",
        ]);

        await updateTimeEntry(
          session,
          Number.parseInt(params.id),
          parseFloat(hours),
          description,
        );

        return new Response(null, { status: 201 });
      case "DELETE":
        checkIDOrThrow(params.id);

        await deleteTimeEntry(session, Number.parseInt(params.id));

        return new Response(null, { status: 204 });
      default:
        throw new Response("Method Not Allowed", { status: 405 });
    }
  } catch (e) {
    if (e instanceof AuthenticationFailed) {
      throw redirect("/login");
    }
    throw e;
  }
}
