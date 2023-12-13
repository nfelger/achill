import { getItemForEventType } from "~/utils/calendarEventUtils";
import { datesEqual, getWeekDaysFor } from "~/utils/dateUtils";
import { convertFloatTimeToHHMM } from "~/utils/timeConverter";
import { TransformedCalendarEvent } from "~/utils/transformCalendarEvents";

interface Props {
  timesAndEventsOfSelectedWeek: {
    hours: number;
    events: TransformedCalendarEvent[];
  }[];
  selectedDate: Date;
  onSelectDate: (newDate: Date) => unknown;
}

export function WeekTable({
  timesAndEventsOfSelectedWeek,
  selectedDate,
  onSelectDate,
}: Props) {
  const weekdays = ["M", "T", "W", "T", "F"];
  const selectedWeek = getWeekDaysFor(selectedDate);

  function getDateClassNames(index: number, selectedDate: Date) {
    let dateClasses = "flex h-8 w-8 items-center justify-center rounded-full ";
    let date = selectedWeek[index];

    if (datesEqual(date, new Date())) {
      dateClasses += "outline-none ring-2 ring-black ring-offset-2 ";
    }

    if (datesEqual(date, selectedDate)) {
      dateClasses += "bg-blue-600 text-white hover:bg-blue-700 ";
    } else {
      dateClasses += "text-black hover:bg-[#B8BDC3] ";
    }

    return dateClasses;
  }

  function getIconForEvent(event: TransformedCalendarEvent) {
    if (event === undefined) {
      return undefined;
    }

    return getItemForEventType(event.type);
  }

  return (
    <div className="flex items-center justify-between">
      <table className="w-full">
        <thead>
          <tr>
            {weekdays.map((weekday, index) => (
              <th key={index}>
                <div className="flex w-full justify-center">
                  <p className="text-center text-base font-medium text-gray-600">
                    {weekday}
                  </p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {selectedWeek.map((date, index) => (
              <td key={index}>
                <div
                  className="h-full w-full"
                  data-testid={
                    ["btn-mon", "btn-tue", "btn-wed", "btn-thu", "btn-fri"][
                      index
                    ]
                  }
                  onClick={() => onSelectDate(date)}
                >
                  <div className="flex w-full cursor-pointer items-center justify-center rounded-full px-2 py-2 text-base font-medium">
                    <p className={getDateClassNames(index, selectedDate)}>
                      {date.getDate()}
                    </p>
                  </div>
                </div>
              </td>
            ))}
          </tr>
          <tr>
            {timesAndEventsOfSelectedWeek.map((data, index) => (
              <td key={index}>
                <div
                  className="flex min-w-[6ch] cursor-pointer justify-center px-2 py-2"
                  onClick={() => onSelectDate(selectedWeek[index])}
                >
                  {data.events.length && getIconForEvent(data.events[0]) ? (
                    <span
                      data-testid={
                        [
                          "event-mon",
                          "event-tue",
                          "event-wed",
                          "event-thu",
                          "event-fri",
                        ][index]
                      }
                      className="material-symbols-outlined"
                    >
                      {getIconForEvent(data.events[0])}
                    </span>
                  ) : (
                    <p
                      data-testid={
                        [
                          "hours-mon",
                          "hours-tue",
                          "hours-wed",
                          "hours-thu",
                          "hours-fri",
                        ][index]
                      }
                      className={`text-base font-medium ${
                        data.hours == 0 ? "text-gray-500" : "text-blue-600"
                      }`}
                    >
                      {convertFloatTimeToHHMM(data.hours)}
                    </p>
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
