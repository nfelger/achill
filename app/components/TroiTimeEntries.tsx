import {
  convertFloatTimeToHHMM,
  convertTimeStringToFloat,
} from "~/utils/timeConverter";
import { TimeEntryForm } from "./TimeEntryForm";
import { TrackyTask } from "~/tasks/TrackyTask";
import { Fragment } from "react";
import { CalculationPosition } from "~/troi/troi.types";
import { TimeEntry } from "~/troi/troi.types";
import moment from "moment";
import { useFetcher } from "@remix-run/react";

interface Props {
  selectedDate: Date;
  calculationPositions: CalculationPosition[];
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  entries: TimeEntry[];
  disabled: boolean;
}

export function TroiTimeEntries({
  selectedDate,
  calculationPositions,
  recurringTasks,
  phaseTasks,
  entries,
  disabled = false,
}: Props) {
  const troiFetcher = useFetcher({ key: "Troi" });

  async function addEntry(
    position: CalculationPosition,
    hours: number,
    description: string,
  ) {
    troiFetcher.submit(
      {
        hours,
        description,
        calculationPositionId: position.id,
        date: moment(selectedDate).format("YYYY-MM-DD"),
      },
      {
        method: "POST",
        action: `/time_entries`,
      },
    );
  }

  async function updateEntry(entry: TimeEntry) {
    troiFetcher.submit(
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

  async function deleteEntry(entry: TimeEntry) {
    troiFetcher.submit(
      {},
      {
        method: "DELETE",
        action: `/time_entries/${entry.id}`,
      },
    );
  }

  async function submitEntry(
    position: CalculationPosition,
    newHours: string,
    newDescription: string,
    entry: TimeEntry | undefined = undefined,
  ) {
    if (entry) {
      updateEntry({
        ...entry,
        hours: convertTimeStringToFloat(newHours),
        description: newDescription,
      });
    } else {
      addEntry(position, convertTimeStringToFloat(newHours), newDescription);
    }
  }

  return calculationPositions.map((position) => (
    <section
      key={position.id}
      className="bg-white p-4"
      data-testid={`project-section-${position.id}`}
    >
      <div className="container mx-auto pb-2">
        {entries.find(
          ({ calculationPosition }) => calculationPosition === position.id,
        ) === undefined ? (
          <TimeEntryForm
            calculationPosition={position}
            recurringTasks={recurringTasks}
            phaseTasks={phaseTasks}
            addOrUpdateClicked={(hours, description) =>
              submitEntry(position, hours, description)
            }
            disabled={disabled}
          />
        ) : (
          entries
            .filter(
              ({ calculationPosition }) => calculationPosition === position.id,
            )
            .map((entry) => (
              <Fragment key={entry.id}>
                <div data-testid={`entryCard-${position.id}`}>
                  <div
                    data-test="entry-form"
                    className="my-2 flex justify-center"
                  >
                    <div className="block w-full">
                      <TimeEntryForm
                        values={{
                          hours: convertFloatTimeToHHMM(entry.hours),
                          description: entry.description,
                        }}
                        addOrUpdateClicked={(hours, description) =>
                          submitEntry(position, hours, description, entry)
                        }
                        deleteClicked={() => deleteEntry(entry)}
                        recurringTasks={recurringTasks}
                        phaseTasks={phaseTasks}
                        calculationPosition={position}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </div>
                <br />
              </Fragment>
            ))
        )}
      </div>
    </section>
  ));
}
