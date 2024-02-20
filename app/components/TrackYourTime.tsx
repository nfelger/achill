import moment from "moment";
import { useState } from "react";
import type { CalendarEvent } from "troi-library";
import {
  PersonioAttendance,
  WorkingHours,
} from "~/apis/personio/Personio.types";
import {
  TrackyTask,
  filterPhaseTasks,
  filterRecurringTasks,
} from "~/apis/tasks/TrackyTask";
import type {
  CalculationPosition,
  TroiProjectTimesById,
} from "~/apis/troi/troi.types";
import { END_DATE, START_DATE, getWeekDaysFor } from "~/utils/dateTimeUtils";
import {
  TransformedCalendarEvent,
  transformCalendarEvent,
} from "~/utils/transformCalendarEvents";
import { WorkTimeForm } from "../routes/work_time.($id)";
import { ProjectTimes } from "./projectTime/ProjectTimes";
import { InfoBanner } from "./week/InfoBanner";
import { WeekView } from "./week/WeekView";

function findEventsOfDate(
  calendarEvents: TransformedCalendarEvent[],
  date: Date,
) {
  return calendarEvents.filter((calendarEvent) =>
    moment(calendarEvent.date).isSame(date, "day"),
  );
}

function findProjectTimesOfDate(
  projectTimesById: TroiProjectTimesById,
  date: Date,
) {
  return Object.values(projectTimesById).filter((projectTime) =>
    moment(projectTime.date).isSame(date, "day"),
  );
}

function calcHoursOfDate(projectTimesById: TroiProjectTimesById, date: Date) {
  return findProjectTimesOfDate(projectTimesById, date).reduce(
    (acc, projectTime) => acc + projectTime.hours,
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

interface Props {
  timestamp: number;
  calculationPositions: CalculationPosition[];
  calendarEvents: CalendarEvent[];
  projectTimesById: TroiProjectTimesById;
  tasks: TrackyTask[];
  workingHours: WorkingHours;
  attendances: PersonioAttendance[];
}

export default function TrackYourTime(props: Props) {
  const [attendances, setAttendances] = useState(props.attendances);

  // set state to loader data after loading
  const [prevTimestamp, setPrevTimestamp] = useState(props.timestamp);
  if (props.timestamp !== prevTimestamp) {
    setPrevTimestamp(props.timestamp);
    setAttendances(props.attendances);
  }

  const recurringTasks = filterRecurringTasks(props.tasks);
  const phaseTasks = filterPhaseTasks(props.tasks);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedWeek = getWeekDaysFor(selectedDate);

  const calendarEvents = props.calendarEvents
    .map((calendarEvent) =>
      transformCalendarEvent(calendarEvent, START_DATE, END_DATE),
    )
    .flat();
  const selectedDayEvents = findEventsOfDate(calendarEvents, selectedDate);
  const timesAndEventsOfSelectedWeek = selectedWeek.map((weekday) => ({
    hours: calcHoursOfDate(props.projectTimesById, weekday),
    events: findEventsOfDate(calendarEvents, weekday),
  }));
  const workingHoursOfSelectedDate =
    props.workingHours[DAYS_OF_WEEK[moment(selectedDate).weekday() - 1]];

  const positions = props.calculationPositions;

  const projectTimesForSelectedDate = findProjectTimesOfDate(
    props.projectTimesById,
    selectedDate,
  );

  const attendancesOfSelectedWeek: (PersonioAttendance | undefined)[] =
    selectedWeek.map((element) => {
      const date = moment(element).format("YYYY-MM-DD");
      return attendances.find((attendance) => attendance.date === date);
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
      <section className="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
        <WorkTimeForm
          key={selectedDate.getDate()}
          selectedDate={selectedDate}
          workTime={workingHoursOfSelectedDate}
          attendances={attendances}
          setAttendances={setAttendances}
        />
      </section>

      <h2
        className="mt-8 mb-4 text-lg font-semibold text-gray-900"
        title="Working hours"
      >
        Project hours
      </h2>
      {!selectedDayEvents?.some((event) => event.type == "Holiday") && (
        <ProjectTimes
          selectedDate={selectedDate}
          calculationPositions={positions ?? []}
          recurringTasks={recurringTasks}
          phaseTasks={phaseTasks}
          projectTimes={projectTimesForSelectedDate}
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
