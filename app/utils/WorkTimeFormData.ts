import moment from "moment";
import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";
import type { Time } from "./Time";
import { timeSchema } from "./Time";

const YYYY_MM_DD_FORMAT = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;

export type WorkTimeFormData = {
  startTime: Time;
  breakTime: Time;
  endTime: Time;
  comment: string;
  date: string;
};

export const workTimeFormDataSchema = z.object({
  startTime: timeSchema,
  breakTime: timeSchema,
  endTime: timeSchema,
  comment: z.string(),
  date: z.string().regex(YYYY_MM_DD_FORMAT),
}) satisfies ZodSchema<WorkTimeFormData, ZodTypeDef, unknown>;

export function workTimeFormDataToStartDate({
  date,
  startTime,
}: WorkTimeFormData) {
  return moment(date)
    .set("hours", startTime.hours)
    .set("minutes", startTime.minutes)
    .toDate();
}

export function workTimeFormDataToEndDate({ date, endTime }: WorkTimeFormData) {
  return moment(date)
    .set("hours", endTime.hours)
    .set("minutes", endTime.minutes)
    .toDate();
}
