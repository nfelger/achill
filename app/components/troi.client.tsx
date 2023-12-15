import { useState } from "react";
import { InfoBanner } from "./InfoBanner";
import { addDaysToDate, getWeekDaysFor } from "~/utils/dateUtils";
import { WeekView } from "./WeekView";
import { TroiTimeEntries } from "./TroiTimeEntries";
import { useTasks } from "~/tasks/useTasks";
import type { CalendarEvent } from "troi-library";
import {
  TransformedCalendarEvent,
  transformCalendarEvent,
} from "~/utils/transformCalendarEvents";
import moment from "moment";
import { TimeEntries, TimeEntry } from "~/troi/TimeEntry";
import { CalculationPosition } from "~/troi/CalculationPosition";
import { useFetcher } from "@remix-run/react";
import { LoadingOverlay } from "./LoadingOverlay";

interface Props {
  username: string;
  password: string;
  calculationPositions: CalculationPosition[];
  calendarEvents: CalendarEvent[];
  timeEntries: TimeEntries;
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

export default function Troi(props: Props) {
  const { recurringTasks, phaseTasks } = useTasks();

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

  const positions = props.calculationPositions;

  const entriesForSelectedDate = findTimeEntriesOfDate(
    props.timeEntries,
    selectedDate,
  );

  const fetcher = useFetcher();

  async function onAddEntryClicked(
    position: CalculationPosition,
    hours: number,
    description: string,
  ) {
    fetcher.submit(
      {
        hours,
        description,
      },
      {
        method: "POST",
        action: `/calculation_postions/${position.id}/time_entries/${moment(
          selectedDate,
        ).format("YYYY-MM-DD")}`,
      },
    );
  }

  async function onUpdateEntryClicked(entry: TimeEntry) {
    fetcher.submit(
      {
        hours: entry.hours,
        description: entry.description,
      },
      {
        method: "PUT",
        action: `/time_entries/${entry.id}`,
      },
    );
  }

  async function onDeleteEntryClicked(entry: TimeEntry) {
    fetcher.submit(
      {},
      {
        method: "DELETE",
        action: `/time_entries/${entry.id}`,
      },
    );
  }

  return (
    <div>
      <section className="p-4">
        <a
          className="angie-link"
          href="https://digitalservicebund.atlassian.net/wiki/spaces/DIGITALSER/pages/359301512/Time+Tracking"
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
        />
      </section>

      {selectedDayEvents?.map((event) => (
        <InfoBanner
          key={`${event.date.getTime()}-${event.type ?? ""}`}
          event={event}
        />
      ))}

      {!selectedDayEvents?.some((event) => event.type == "Holiday") && (
        <TroiTimeEntries
          calculationPositions={positions ?? []}
          recurringTasks={recurringTasks}
          phaseTasks={phaseTasks}
          entries={entriesForSelectedDate}
          deleteEntry={onDeleteEntryClicked}
          updateEntry={onUpdateEntryClicked}
          addEntry={onAddEntryClicked}
          disabled={false}
        />
      )}

      <section className="mt-8 text-xs text-gray-600">
        <p>
          Project not showing up? Make sure it's available in Troi and marked as
          a "favorite".
        </p>
      </section>

      {fetcher.state !== "idle" && <LoadingOverlay message="Please wait..." />}
    </div>
  );
}
