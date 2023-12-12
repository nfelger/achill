import { useTroi } from "~/troi/useTroi.hook";
import { LoadingOverlay } from "./LoadingOverlay";
import { useEffect, useState } from "react";
import { TimeEntry } from "troi-library";
import { InfoBanner } from "./InfoBanner";
import { getWeekDaysFor } from "~/utils/dateUtils";
import { WeekView } from "./WeekView";

interface Props {
  username: string;
  password: string;
}

export default function Troi(props: Props) {
  const { troiController, loading, initialized } = useTroi(
    props.username,
    props.password,
  );

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

      {selectedDayEvents?.map((event) => <InfoBanner event={event} />)}

      <section className="mt-8 text-xs text-gray-600">
        <p>
          Project not showing up? Make sure it's available in Troi and marked as
          a "favorite".
        </p>
      </section>
    </div>
  );
}
