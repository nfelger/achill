import { expect, test } from "@playwright/test";
import {
  getItemForEventType,
  getDescriptionForEventType,
} from "$lib/utils/calendarEventUtils.js";

import { CalendarEventType } from "$lib/stores/transformCalendarEvents";

test("getItemForEventType should return correct icons", async ({}) => {
  expect(getItemForEventType(CalendarEventType.Holiday)).toBe("wb_sunny");
  expect(getItemForEventType(CalendarEventType.Training)).toBe("school");
  expect(getItemForEventType(CalendarEventType.PaidVacation)).toBe(
    "beach_access"
  );
  expect(getItemForEventType(CalendarEventType.UnpaidVacation)).toBe(
    "beach_access"
  );
  expect(getItemForEventType(CalendarEventType.CompensatoryTimeOff)).toBe(
    "beach_access"
  );
  expect(getItemForEventType(CalendarEventType.Sick)).toBe("sick");
  expect(getItemForEventType("NonExistentEventType")).toBe("close");
});

test("getDescriptionForEventType should return correct descriptions", async ({}) => {
  expect(getDescriptionForEventType(CalendarEventType.Holiday)).toBe(
    "Public holiday, working impossible"
  );
  expect(getDescriptionForEventType(CalendarEventType.Training)).toBe(
    "Learning"
  );
  expect(getDescriptionForEventType(CalendarEventType.PaidVacation)).toBe(
    "You are on paid vacation"
  );
  expect(getDescriptionForEventType(CalendarEventType.UnpaidVacation)).toBe(
    "You are on unpaid vacation"
  );
  expect(
    getDescriptionForEventType(CalendarEventType.CompensatoryTimeOff)
  ).toBe("Looks like you had some over hours");
  expect(getDescriptionForEventType(CalendarEventType.Sick)).toBe("Sick leave");
  expect(getDescriptionForEventType("NonExistentEventType")).toBe("Unknown");
});
