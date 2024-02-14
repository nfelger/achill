import { TransformedCalendarEvent } from "~/utils/transformCalendarEvents";
import { WeekTable } from "./WeekTable";
import { WeekSelect } from "./WeekSelect";
import { PersonioAttendance } from "~/apis/personio/Personio.types";

interface Props {
  timesAndEventsOfSelectedWeek: {
    hours: number;
    events: TransformedCalendarEvent[];
  }[];
  selectedDate: Date;
  onSelectDate: (newDate: Date) => unknown;
  attendancesOfSelectedWeek: (PersonioAttendance | undefined)[];
}

export function WeekView({
  timesAndEventsOfSelectedWeek,
  selectedDate,
  onSelectDate,
  attendancesOfSelectedWeek,
}: Props) {
  return (
    <div className="flex p-4">
      <div className="w-full">
        <div>
          <div className="flex flex-wrap gap-8">
            <div className="min-w-[30ch]">
              <WeekSelect
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
              />
              <div
                data-testid="date"
                tabIndex={0}
                className="text-base font-bold text-gray-800 focus:outline-none"
              >
                {selectedDate.toLocaleDateString("en-gb", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="rounded-t bg-white">
              <WeekTable
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                timesAndEventsOfSelectedWeek={timesAndEventsOfSelectedWeek}
                attendancesOfSelectedWeek={attendancesOfSelectedWeek}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
