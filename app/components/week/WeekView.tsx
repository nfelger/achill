import { PersonioAttendance } from "~/apis/personio/Personio.types";
import type { ProjectTime } from "~/apis/troi/troi.types";
import { getWeekDaysFor } from "~/utils/dateTimeUtils";
import { TransformedCalendarEvent } from "~/utils/transformCalendarEvents";
import { findEventsOfDate, findProjectTimesOfDate } from "../TrackYourTime";
import { InfoBanner } from "./InfoBanner";
import { WeekSelect } from "./WeekSelect";
import { WeekTable } from "./WeekTable";

function calcHoursOfDate(projectTimes: ProjectTime[], date: Date) {
  return findProjectTimesOfDate(projectTimes, date).reduce(
    (acc, projectTime) => acc + projectTime.hours,
    0,
  );
}

interface Props {
  selectedDate: Date;
  projectTimes: ProjectTime[];
  calendarEvents: TransformedCalendarEvent[];
  onSelectDate: (newDate: Date) => unknown;
  attendancesOfSelectedWeek: (PersonioAttendance | undefined)[];
  selectedDayEvents: TransformedCalendarEvent[];
}
export function WeekView({
  selectedDate,
  projectTimes,
  calendarEvents,
  onSelectDate,
  attendancesOfSelectedWeek,
  selectedDayEvents,
}: Props) {
  const selectedWeek = getWeekDaysFor(selectedDate);
  const timesAndEventsOfSelectedWeek = selectedWeek.map((weekday) => ({
    hours: calcHoursOfDate(projectTimes, weekday),
    events: findEventsOfDate(calendarEvents, weekday),
  }));
  return (
    <div className="flex flex-wrap gap-8">
      <div className="min-w-[30ch]">
        <WeekSelect selectedDate={selectedDate} onSelectDate={onSelectDate} />
        <div
          data-testid="date"
          tabIndex={0}
          className="text-base text-gray-800 focus:outline-none"
        >
          {selectedDate.toLocaleDateString("en-gb", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <WeekTable
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        timesAndEventsOfSelectedWeek={timesAndEventsOfSelectedWeek}
        attendancesOfSelectedWeek={attendancesOfSelectedWeek}
      />

      {selectedDayEvents?.map((event) => (
        <InfoBanner
          key={`${event.date.getTime()}-${event.type ?? ""}`}
          event={event}
        />
      ))}
    </div>
  );
}
