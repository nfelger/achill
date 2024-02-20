import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { AuthenticationFailed } from "troi-library";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import {
  addProjectTime,
  deleteProjectTime,
  updateProjectTime,
} from "~/apis/troi/troiApiController";
import { convertTimeToFloat } from "~/utils/dateTimeUtils";
import type { ProjectTimeSaveFormData } from "~/utils/projectTimeFormValidator";
import { projectTimeSaveFormSchema } from "~/utils/projectTimeFormValidator";

function checkIDOrThrow(
  ID: string | undefined,
): asserts ID is NonNullable<string> {
  if (ID === undefined) {
    throw new Response("ProjectTime ID is required.", { status: 400 });
  }
}

function parseProjectTimeFormData(formData: FormData): ProjectTimeSaveFormData {
  try {
    return projectTimeSaveFormSchema.parse(
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
    parseProjectTimeFormData(formData);
  const hoursFloat = convertTimeToFloat(hours);

  try {
    switch (request.method) {
      case "POST":
        await addProjectTime(
          session,
          parseInt(calculationPositionId),
          date,
          hoursFloat,
          description,
        );

        return new Response(null, { status: 201 });
      case "PUT":
        checkIDOrThrow(params.id);

        await updateProjectTime(
          session,
          parseInt(params.id),
          hoursFloat,
          description,
        );

        return new Response(null, { status: 201 });
      case "DELETE":
        checkIDOrThrow(params.id);

        await deleteProjectTime(session, parseInt(params.id));

        return new Response(null, { status: 204 });
      default:
        throw new Response("Method Not Allowed", { status: 405 });
    }
  } catch (e) {
    if (e instanceof AuthenticationFailed) {
      console.error("Troi auth failed", e);
      throw redirect("/login");
    }
    throw e;
  }
}
