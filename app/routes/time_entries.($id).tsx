import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { AuthenticationFailed } from "troi-library";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import {
  addTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
} from "~/troi/troiApiController";
import { convertTimeToFloat } from "~/utils/dateTimeUtils";
import type { TimeEntrySaveFormData } from "~/utils/timeEntryFormValidator";
import { timeEntrySaveFormSchema } from "~/utils/timeEntryFormValidator";

function checkIDOrThrow(
  ID: string | undefined,
): asserts ID is NonNullable<string> {
  if (ID === undefined) {
    throw new Response("Entry ID is required.", { status: 400 });
  }
}

function parseTimeEntryFormData(formData: FormData): TimeEntrySaveFormData {
  try {
    return timeEntrySaveFormSchema.parse(
      Object.fromEntries(formData.entries()),
    );
  } catch (error) {
    throw json(error, { status: 400 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);
  const formData = await request.formData();
  const { calculationPositionId, date, hours, description } =
    parseTimeEntryFormData(formData);
  const hoursFloat = convertTimeToFloat(hours);

  try {
    switch (request.method) {
      case "POST":
        await addTimeEntry(
          session,
          parseInt(calculationPositionId),
          date,
          hoursFloat,
          description,
        );

        return new Response(null, { status: 201 });
      case "PUT":
        checkIDOrThrow(params.id);

        await updateTimeEntry(
          session,
          parseInt(params.id),
          hoursFloat,
          description,
        );

        return new Response(null, { status: 201 });
      case "DELETE":
        checkIDOrThrow(params.id);

        await deleteTimeEntry(session, parseInt(params.id));

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
