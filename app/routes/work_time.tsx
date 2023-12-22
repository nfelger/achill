import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import moment from "moment";
import { z } from "zod";
import { postAttendance } from "~/personio/PersonioCacheController";
import { isSessionValid } from "~/sessions.server";

const HH_MM_FORMAT_WITH_LEADING_0 = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const YYYY_MM_DD_FORMAT =
  /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[0-1])$/;

const timeSchema = z
  .string()
  .regex(HH_MM_FORMAT_WITH_LEADING_0)
  .transform((time) => {
    const [hours, minutes] = time.split(":");
    return {
      hours: parseInt(hours, 10),
      minutes: parseInt(minutes, 10),
    };
  });

const formDataSchema = z.object({
  startTime: timeSchema,
  breakTime: timeSchema,
  workTime: timeSchema,
  comment: z.string(),
  date: z.string().regex(YYYY_MM_DD_FORMAT),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Response("Method Not Allowed", { status: 405 });
  }

  if (!(await isSessionValid(request))) {
    throw redirect("/login");
  }

  const formData = await request.formData();
  const parseResult = formDataSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parseResult.success) {
    throw json(parseResult.error, { status: 400 });
  }
  const { startTime, breakTime, workTime, comment, date } = parseResult.data;

  const startDate = moment(date)
    .set("hours", startTime.hours)
    .set("minutes", startTime.minutes)
    .toDate();
  const endDate = moment(date)
    .set("hours", startTime.hours)
    .set("minutes", startTime.minutes)
    .add(breakTime.hours, "hours")
    .add(breakTime.minutes, "minutes")
    .add(workTime.hours, "hours")
    .add(workTime.minutes, "minutes")
    .toDate();

  return postAttendance(
    request,
    startDate,
    endDate,
    breakTime.hours * 60 + breakTime.minutes,
    comment,
  );
}
