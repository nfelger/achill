/* eslint-disable no-case-declarations */
import { ActionFunctionArgs, Session, json, redirect } from "@remix-run/node";
import { timeToMinutes } from "~/utils/Time";
import {
  workTimeFormDataSchema,
  workTimeFormDataToEndDate,
  workTimeFormDataToStartDate,
} from "~/utils/WorkTimeFormData";
import {
  deleteAttendance,
  patchAttendance,
  postAttendance,
} from "~/personio/PersonioCacheController";
import { getSession, isSessionValid } from "~/sessions.server";

function checkIDAndPermission(
  session: Session,
  ID: string | undefined,
): asserts ID is NonNullable<string> {
  if (ID === undefined || ID === null) {
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

export async function action({ request, params }: ActionFunctionArgs) {
  if (!(await isSessionValid(request))) {
    throw redirect("/login");
  }

  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const formData = await request.formData();
  const parseResult = workTimeFormDataSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parseResult.success) {
    throw json(parseResult.error, { status: 400 });
  }
  const workTimeFormData = parseResult.data;

  switch (request.method) {
    case "POST":
      return postAttendance(
        request,
        workTimeFormDataToStartDate(workTimeFormData),
        workTimeFormDataToEndDate(workTimeFormData),
        timeToMinutes(workTimeFormData.breakTime),
        workTimeFormData.comment,
      );
    case "DELETE":
      checkIDAndPermission(session, params.id);
      const response = await deleteAttendance(
        request,
        Number.parseInt(params.id, 10),
      );

      if (!response.success) {
        throw new Response(response.error.message, { status: 400 });
      }

      return new Response(null, { status: 204 });
    case "PATCH":
      checkIDAndPermission(session, params.id);
      return patchAttendance(
        request,
        Number.parseInt(params.id, 10),
        workTimeFormDataToStartDate(workTimeFormData),
        workTimeFormDataToEndDate(workTimeFormData),
        timeToMinutes(workTimeFormData.breakTime),
        workTimeFormData.comment,
      );
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
}
