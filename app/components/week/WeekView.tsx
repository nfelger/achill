import { PersonioAttendance } from "~/apis/personio/Personio.types";
import { TransformedCalendarEvent } from "~/utils/transformCalendarEvents";
import { InfoBanner } from "./InfoBanner";
import { WeekSelect } from "./WeekSelect";
import { WeekTable } from "./WeekTable";

interface Props {
  timesAndEventsOfSelectedWeek: {
    hours: number;
    events: TransformedCalendarEvent[];
  }[];
  selectedDate: Date;
  onSelectDate: (newDate: Date) => unknown;
  attendancesOfSelectedWeek: (PersonioAttendance | undefined)[];
  selectedDayEvents: TransformedCalendarEvent[];
}

export function WeekView({
  timesAndEventsOfSelectedWeek,
  selectedDate,
  onSelectDate,
  attendancesOfSelectedWeek,
  selectedDayEvents,
}: Props) {
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
