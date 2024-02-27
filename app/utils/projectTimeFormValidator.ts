import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";
import {
  YYYY_MM_DD_FORMAT,
  convertTimeToFloat,
  timeSchema,
} from "./dateTimeUtils";

export type ProjectTimeSaveFormData = {
  calculationPositionId: number;
  date: string;
  hours: number;
  description: string;
};

export const projectTimeSaveFormSchema = z.object({
  calculationPositionId: z.string().transform((id) => parseInt(id)),
  date: z.string().regex(YYYY_MM_DD_FORMAT),
  hours: timeSchema.transform(convertTimeToFloat),
  description: z.string().min(1, "Description is required."),
}) satisfies ZodSchema<ProjectTimeSaveFormData, ZodTypeDef, unknown>;
