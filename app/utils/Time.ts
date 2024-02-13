import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";

const HH_MM_FORMAT_WITH_LEADING_0 = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
export const YYYY_MM_DD_FORMAT =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;

export type Time = {
  hours: number;
  minutes: number;
};

export const timeSchema = z
  .string()
  .regex(HH_MM_FORMAT_WITH_LEADING_0)
  .transform((time): Time => {
    const [hours, minutes] = time.split(":");
    return {
      hours: parseInt(hours, 10),
      minutes: parseInt(minutes, 10),
    };
  }) satisfies ZodSchema<Time, ZodTypeDef, unknown>;

export function timeToMinutes(time: Time) {
  return time.hours * 60 + time.minutes;
}
