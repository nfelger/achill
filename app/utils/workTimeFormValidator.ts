import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";
import type { Time } from "./dateTimeUtils";
import { YYYY_MM_DD_FORMAT, timeSchema } from "./dateTimeUtils";

export type WorkTimeFormData = {
  startTime: Time;
  breakTime: Time;
  endTime: Time;
  date: string;
  _action: "POST" | "PATCH" | "DELETE";
};

export const workTimeFormDataSchema = z.object({
  startTime: timeSchema,
  breakTime: timeSchema,
  endTime: timeSchema,
  date: z.string().regex(YYYY_MM_DD_FORMAT),
  _action: z.enum(["POST", "PATCH", "DELETE"]),
}) satisfies ZodSchema<WorkTimeFormData, ZodTypeDef, unknown>;
