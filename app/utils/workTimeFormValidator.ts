import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";
import type { Time } from "./dateTimeUtils";
import { timeSchema, YYYY_MM_DD_FORMAT } from "./dateTimeUtils";

export type WorkTimeFormData = {
  startTime: Time;
  breakTime: Time;
  endTime: Time;
  comment: string;
  date: string;
  _intent: "POST" | "PATCH" | "DELETE";
};

export const workTimeFormDataSchema = z.object({
  startTime: timeSchema,
  breakTime: timeSchema,
  endTime: timeSchema,
  comment: z.string(),
  date: z.string().regex(YYYY_MM_DD_FORMAT),
  _intent: z.enum(["POST", "PATCH", "DELETE"]),
}) satisfies ZodSchema<WorkTimeFormData, ZodTypeDef, unknown>;
