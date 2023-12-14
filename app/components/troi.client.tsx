import { useTroi } from "~/troi/useTroi.hook";
import { LoadingOverlay } from "./LoadingOverlay";
import { useEffect, useState } from "react";
import { TimeEntry } from "troi-library";
import { InfoBanner } from "./InfoBanner";
import { getWeekDaysFor } from "~/utils/dateUtils";
import { WeekView } from "./WeekView";
import { TroiTimeEntries } from "./TroiTimeEntries";
import { Project } from "~/troi/troiController";
import { useTasks } from "~/tasks/useTasks";

interface Props {
  username: string;
  password: string;
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

  const selectedDayEvents = troiController?.getEventsFor(selectedDate);
  const timesAndEventsOfSelectedWeek =
    troiController?.getTimesAndEventsFor(selectedWeek) ?? [];
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
