import moment from "moment";
import { useState } from "react";
import {
  DAYS_OF_WEEK,
  PersonioAttendance,
  WorkingHours,
} from "~/apis/personio/Personio.types";
import { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import { TrackyTask } from "~/apis/tasks/TrackyTask";
import type {
  CalculationPosition,
  CalendarEvent,
  ProjectTime,
} from "~/apis/troi/troi.types";
import { END_DATE, START_DATE, getWeekDaysFor } from "~/utils/dateTimeUtils";
import {
  TransformedCalendarEvent,
  transformCalendarEvent,
} from "~/utils/transformCalendarEvents";
import { WorkTimeForm } from "../routes/work_time.($id)";
import { ProjectTimes } from "./ProjectTimes";
import { WeekView } from "./week/WeekView";

export function findEventsOfDate(
  calendarEvents: TransformedCalendarEvent[],
  date: Date,
) {
  return calendarEvents.filter((calendarEvent) =>
    moment(calendarEvent.date).isSame(date, "day"),
  );
}

export function findProjectTimesOfDate(
  projectTimes: ProjectTime[],
  date: Date,
) {
  return projectTimes.filter((projectTime) =>
    moment(projectTime.date).isSame(date, "day"),
  );
}

interface Props {
  timestamp: number;
  calculationPositions: CalculationPosition[];
  calendarEvents: CalendarEvent[];
  projectTimes: ProjectTime[];
  tasks: TrackyTask[];
  phasesPerCalculationPosition: Record<number, TrackyPhase[]>;
  workingHours: WorkingHours;
  attendances: PersonioAttendance[];
}
export default function TrackYourTime(props: Props) {
  const [attendances, setAttendances] = useState(props.attendances);
  const [projectTimes, setProjectTimes] = useState(props.projectTimes);

  // set state to loader data after loading
  const [prevTimestamp, setPrevTimestamp] = useState(props.timestamp);
  if (props.timestamp !== prevTimestamp) {
    setPrevTimestamp(props.timestamp);
    setAttendances(props.attendances);
    setProjectTimes(props.projectTimes);
  }

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedWeek = getWeekDaysFor(selectedDate);
  const calendarEvents = props.calendarEvents.flatMap((calendarEvent) =>
    transformCalendarEvent(calendarEvent, START_DATE, END_DATE),
  );
  const selectedDayEvents = findEventsOfDate(calendarEvents, selectedDate);
  const workingHoursOfSelectedDate =
    props.workingHours[DAYS_OF_WEEK[moment(selectedDate).weekday() - 1]];

  const attendancesOfSelectedWeek: (PersonioAttendance | undefined)[] =
    selectedWeek.map((day) => {
      const date = moment(day).format("YYYY-MM-DD");
      return attendances.find((attendance) => attendance.date === date);
    });

  return (
    <div>
      <section className="py-4">
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
          selectedDate={selectedDate}
          projectTimes={projectTimes}
          calendarEvents={calendarEvents}
          onSelectDate={setSelectedDate}
          attendancesOfSelectedWeek={attendancesOfSelectedWeek}
          selectedDayEvents={selectedDayEvents}
        />
      </section>

      <section>
        <h2 className="mt-8 mb-4 text-lg font-semibold text-gray-900">
          Working hours
        </h2>
        <WorkTimeForm
          key={selectedDate.getDate()}
          selectedDate={selectedDate}
          workTime={workingHoursOfSelectedDate}
          attendances={attendances}
          setAttendances={setAttendances}
        />
      </section>

      <section>
        <h2 className="mt-8 mb-4 text-lg font-semibold text-gray-900">
          Project hours
        </h2>
        {!selectedDayEvents?.some((event) => event.type == "Holiday") && (
          <ProjectTimes
            key={selectedDate.getDate()}
            selectedDate={selectedDate}
            calculationPositions={props.calculationPositions ?? []}
            tasks={props.tasks}
            phasesPerCalculationPosition={props.phasesPerCalculationPosition}
            projectTimes={projectTimes}
            setProjectTimes={setProjectTimes}
            disabled={false}
          />
        )}
      </section>

      <section className="mt-8 text-xs text-gray-600">
        <p>
          Project not showing up?{" "}
          <a
            className="angie-link"
            href="https://digitalservicebund.atlassian.net/wiki/x/T4BfJg"
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
