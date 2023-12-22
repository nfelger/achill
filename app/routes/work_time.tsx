import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { postAttendance } from "~/personio/PersonioCacheController";
import {
  workTimeFormDataSchema,
  workTimeFormDataToStartDate,
} from "~/utils/WorkTimeFormData";
import { timeToMinutes } from "~/utils/Time";
import { isSessionValid } from "~/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Response("Method Not Allowed", { status: 405 });
  }

  if (!(await isSessionValid(request))) {
    throw redirect("/login");
  }

  const formData = await request.formData();
  const parseResult = workTimeFormDataSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parseResult.success) {
    throw json(parseResult.error, { status: 400 });
  }
  const workTimeFormData = parseResult.data;

  return postAttendance(
    request,
    workTimeFormDataToStartDate(workTimeFormData),
    workTimeFormDataToStartDate(workTimeFormData),
    timeToMinutes(workTimeFormData.breakTime),
    workTimeFormData.comment,
  );
}
