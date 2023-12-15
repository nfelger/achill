import { useTroi } from "~/troi/useTroi.hook";
import { LoadingOverlay } from "./LoadingOverlay";
import { useEffect, useState } from "react";
import { TimeEntry } from "troi-library";
import { InfoBanner } from "./InfoBanner";
import { addDaysToDate, getWeekDaysFor } from "~/utils/dateUtils";
import { WeekView } from "./WeekView";
import { TroiTimeEntries } from "./TroiTimeEntries";
import { Project } from "~/troi/troiController";
import { useTasks } from "~/tasks/useTasks";
import type { CalendarEvent } from "troi-library";
import {
  TransformedCalendarEvent,
  transformCalendarEvent,
} from "~/utils/transformCalendarEvents";
import moment from "moment";
import { TimeEntries } from "~/troi/TimeEntry";

interface Props {
  username: string;
  password: string;
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

function calcHoursOfDate(timeEntries: TimeEntries, date: Date) {
  return Object.values(timeEntries)
    .filter((entry) => moment(entry.date).isSame(date, "day"))
    .reduce((acc, entry) => acc + entry.hours, 0);
}

export default function Troi(props: Props) {
  const { troiController, loading, initialized } = useTroi(
    props.username,
    props.password,
  );
  const { recurringTasks, phaseTasks } = useTasks();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedWeek = getWeekDaysFor(selectedDate);

  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<{
    [projectId: number]: TimeEntry[];
  }>({});

  useEffect(() => {
    if (troiController && initialized) {
      troiController.getEntriesFor(selectedDate).then((entries) => {
        setEntriesForSelectedDate(entries);
      });
    }
  }, [troiController, initialized, selectedDate]);

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

  const positions = troiController?.getProjects();

  async function onAddEntryClicked(
    position: Project,
    hours: number,
    description: string,
  ) {
    await troiController?.addEntry(
      selectedDate,
      position,
      hours,
      description,
      () => {},
    );
    troiController?.getEntriesFor(selectedDate).then((entries) => {
      setEntriesForSelectedDate(entries);
    });
  }

  async function onUpdateEntryClicked(position: Project, entry: TimeEntry) {
    await troiController?.updateEntry(position, entry, () => {});
    troiController?.getEntriesFor(selectedDate).then((entries) => {
      setEntriesForSelectedDate(entries);
    });
  }

  async function onDeleteEntryClicked(entry: TimeEntry, positionId: number) {
    await troiController?.deleteEntry(entry, positionId, () => {});
    troiController?.getEntriesFor(selectedDate).then((entries) => {
      setEntriesForSelectedDate(entries);
    });
  }

  return (
    <div>
      {loading && <LoadingOverlay message={"Please wait..."} />}

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
          positions={positions ?? []}
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
    </div>
  );
}
