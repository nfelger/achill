import { CalendarEventType } from "./transformCalendarEvents";

export function getItemForEventType(type) {
  switch (type) {
    case CalendarEventType.Holiday:
      return "wb_sunny";
    case CalendarEventType.Training:
      return "school";
    case CalendarEventType.PaidVacation:
      return "beach_access";
    case CalendarEventType.UnpaidVacation:
      return "beach_access";
    case CalendarEventType.CompensatoryTimeOff:
      return "beach_access";
    case CalendarEventType.Sick:
      return "sick";
    default:
      return "close";
  }
}

export function getDescriptionForEventType(type) {
  switch (type) {
    case CalendarEventType.Holiday:
      return "Public holiday, working impossible";
    case CalendarEventType.Training:
      return "Learning";
    case CalendarEventType.PaidVacation:
      return "You are on paid vacation";
    case CalendarEventType.UnpaidVacation:
      return "You are on unpaid vacation";
    case CalendarEventType.CompensatoryTimeOff:
      return "Looks like you had some over hours";
    case CalendarEventType.Sick:
      return "Sick leave";
    default:
      return "Unknown";
  }
}
