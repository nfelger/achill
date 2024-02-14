import { useState } from "react";
import { InfoBanner } from "./week/InfoBanner";
import { addDaysToDate, getWeekDaysFor } from "~/utils/dateTimeUtils";
import { WeekView } from "./week/WeekView";
import { TroiTimeEntries } from "./projectTime/ProjectTimes";
import {
  TrackyTask,
  filterPhaseTasks,
  filterRecurringTasks,
} from "~/apis/tasks/TrackyTask";
import type { CalendarEvent } from "troi-library";
import {
  TransformedCalendarEvent,
  transformCalendarEvent,
} from "~/utils/transformCalendarEvents";
import moment from "moment";
import {
  CalculationPosition,
  TimeEntries,
  TimeEntry,
} from "~/apis/troi/troi.types";
import { WorkTimeForm } from "./WorkTimeForm";
import {
  PersonioAttendance,
  WorkingHours,
} from "~/apis/personio/Personio.types";

interface Props {
  calculationPositions: CalculationPosition[];
  calendarEvents: CalendarEvent[];
  timeEntries: TimeEntries;
  tasks: TrackyTask[];
  workingHours: WorkingHours;
  attendances: PersonioAttendance[];
}

function findEventsOfDate(
  calendarEvents: TransformedCalendarEvent[],
  date: Date,
) {
  return calendarEvents.filter((calendarEvent) =>
    moment(calendarEvent.date).isSame(date, "day"),
  );
}

function findTimeEntriesOfDate(timeEntries: TimeEntries, date: Date) {
  return Object.values(timeEntries).filter((entry) =>
    moment(entry.date).isSame(date, "day"),
  );
}

function calcHoursOfDate(timeEntries: TimeEntries, date: Date) {
  return findTimeEntriesOfDate(timeEntries, date).reduce(
    (acc, entry) => acc + entry.hours,
    0,
  );
}

const DAYS_OF_WEEK: Array<keyof WorkingHours> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export default function TrackYourTime(props: Props) {
  const recurringTasks = filterRecurringTasks(props.tasks);
  const phaseTasks = filterPhaseTasks(props.tasks);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedWeek = getWeekDaysFor(selectedDate);

  const calendarEvents = props.calendarEvents
    .map((calendarEvent) =>
      transformCalendarEvent(
        calendarEvent,
        addDaysToDate(new Date(), -366),
        addDaysToDate(new Date(), 366),
      ),
    )
    .flat();
  const selectedDayEvents = findEventsOfDate(calendarEvents, selectedDate);
  const timesAndEventsOfSelectedWeek = selectedWeek.map((weekday) => ({
    hours: calcHoursOfDate(props.timeEntries, weekday),
    events: findEventsOfDate(calendarEvents, weekday),
  }));
  const workingHoursOfSelectedDate =
    props.workingHours[DAYS_OF_WEEK[moment(selectedDate).weekday() - 1]];
  const attendanceOfSelectedDate = props.attendances.find(
    (attendance) =>
      attendance.date === moment(selectedDate).format("YYYY-MM-DD"),
  );

  const positions = props.calculationPositions;

  const entriesForSelectedDate = findTimeEntriesOfDate(
    props.timeEntries,
    selectedDate,
  );

  const attendancesOfSelectedWeek: (PersonioAttendance | undefined)[] =
    selectedWeek.map((element) => {
      const date = moment(element).format("YYYY-MM-DD");
      return props.attendances.find((attendance) => attendance.date === date);
    });

  return (
    <div>
      <section className="p-4">
        <a
          className="angie-link"
          href="https://digitalservicebund.atlassian.net/wiki/x/iIFqFQ"
          target="_blank"
        >
          Read about how to track your time in confluence
        </a>
      </section>
      <section className="z-10 w-full bg-white md:sticky md:top-0">
        <WeekView
          timesAndEventsOfSelectedWeek={timesAndEventsOfSelectedWeek}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          attendancesOfSelectedWeek={attendancesOfSelectedWeek}
        />
      </section>

      {selectedDayEvents?.map((event) => (
        <InfoBanner
          key={`${event.date.getTime()}-${event.type ?? ""}`}
          event={event}
        />
      ))}

      <h2
        className="mb-4 text-lg font-semibold text-gray-900"
        title="Working hours"
      >
        Working hours
      </h2>
      <WorkTimeForm
        key={selectedDate.getDate()}
        selectedDate={selectedDate}
        workTime={workingHoursOfSelectedDate}
        attendance={attendanceOfSelectedDate}
      />

      <h2
        className="mt-8 mb-4 text-lg font-semibold text-gray-900"
        title="Working hours"
      >
        Project hours
      </h2>
      {!selectedDayEvents?.some((event) => event.type == "Holiday") && (
        <TroiTimeEntries
          selectedDate={selectedDate}
          calculationPositions={positions ?? []}
          recurringTasks={recurringTasks}
          phaseTasks={phaseTasks}
          entries={entriesForSelectedDate}
          disabled={false}
        />
      )}

      <section className="mt-8 text-xs text-gray-600">
        <p>
          Project not showing up?{" "}
          <a
            className="angie-link"
            href="https:// digitalservicebund.atlassian.net/wiki/x/T4BfJg"
            target="_blank"
          >
            Make sure it&apos;s available in Troi and marked as a
            &quot;favorite&quot;.
          </a>
        </p>
      </section>
    </div>
  );
}
