import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { timeToMinutes } from "~/utils/Time";
import {
  workTimeFormDataSchema,
  workTimeFormDataToEndDate,
  workTimeFormDataToStartDate,
} from "~/utils/WorkTimeFormData";
import {
  deleteAttendance,
  patchAttendance,
} from "~/personio/PersonioCacheController";
import { isSessionValid } from "~/sessions.server";

export async function action({ request, params }: ActionFunctionArgs) {
  if (!params.id) {
    throw new Response("attendance id required", { status: 400 });
  }

  if (!(await isSessionValid(request))) {
    throw redirect("/login");
  }

  switch (request.method) {
    case "DELETE":
      // todo (Malte Laukötter, 2023-12-22): check that params.id is an attendance of the current employee
      const response = await deleteAttendance(
        request,
        Number.parseInt(params.id, 10),
      );

      if (!response.success) {
        throw new Response(response.error.message, { status: 400 });
      }

      return new Response(null, { status: 204 });
    case "PATCH":
      // todo (Malte Laukötter, 2023-12-22): check that params.id is an attendance of the current employee
      const formData = await request.formData();
      const parseResult = workTimeFormDataSchema.safeParse(
        Object.fromEntries(formData.entries()),
      );

      if (!parseResult.success) {
        throw json(parseResult.error, { status: 400 });
      }
      const workTimeFormData = parseResult.data;

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
