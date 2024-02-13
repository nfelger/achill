/* eslint-disable no-case-declarations */
import { ActionFunctionArgs, Session, json } from "@remix-run/node";
import { getDateTime, timeToMinutes } from "~/utils/dateTimeUtils";
import { workTimeFormDataSchema } from "~/utils/workTimeFormValidator";
import {
  deleteAttendance,
  patchAttendance,
  postAttendance,
} from "~/personio/PersonioCacheController";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";

function checkIDAndPermissionOrThrow(
  session: Session,
  ID: string | undefined,
): asserts ID is NonNullable<string> {
  if (ID === undefined) {
    throw new Response("Attendance ID is required.", { status: 400 });
  }

  const existingAttendances = session.get("personioAttendances");
  const idToDelete = ID.toString();
  if (
    !existingAttendances?.some(
      ({ id }: { id: number }) => id.toString() === idToDelete,
    )
  ) {
    throw new Response(
      "You can not alter an attendance that does not belong to you.",
      { status: 403 },
    );
  }
}

function parseWorkTimeFormData(formData: FormData) {
  try {
    return workTimeFormDataSchema.parse(Object.fromEntries(formData.entries()));
  } catch (error) {
    throw json(error, { status: 400 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);
  const formData = await request.formData();
  const { date, startTime, breakTime, endTime, comment, _intent } =
    parseWorkTimeFormData(formData);

  switch (_intent) {
    case "POST":
      return postAttendance(
        session,
        getDateTime(date, startTime),
        getDateTime(date, endTime),
        timeToMinutes(breakTime),
        comment,
      );
    case "DELETE":
      checkIDAndPermissionOrThrow(session, params.id);

      const response = await deleteAttendance(
        session,
        Number.parseInt(params.id, 10),
      );

      if (!response.success) {
        throw new Response(response.error.message, { status: 400 });
      }

      return new Response(null, { status: 204 });
    case "PATCH":
      checkIDAndPermissionOrThrow(session, params.id);

      return patchAttendance(
        session,
        Number.parseInt(params.id, 10),
        getDateTime(date, startTime),
        getDateTime(date, endTime),
        timeToMinutes(breakTime),
        comment,
      );
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
}
