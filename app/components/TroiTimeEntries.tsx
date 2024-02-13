import { convertFloatTimeToHHMM } from "~/utils/dateTimeUtils";
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
    hours: string,
    description: string,
  ) {
    troiFetcher.submit(
      {
        hours: convertTimeStringToFloat(hours),
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

  async function updateEntry(
    hours: string,
    description: string,
    entryId: number,
  ) {
    troiFetcher.submit(
      {
        hours: hours,
        description: description,
      },
      {
        method: "PUT",
        action: `/time_entries/${entryId}`,
      },
    );
  }

  async function deleteEntry(entryId: number) {
    troiFetcher.submit(
      {},
      {
        method: "DELETE",
        action: `/time_entries/${entryId}`,
      },
    );
  }

  return calculationPositions.map((position) => (
    <section
      key={position.id}
      className="bg-white p-4"
      data-testid={`project-section-${position.id}`}
    >
      <div className="container mx-auto pb-2">
        {!entries.some(
          ({ calculationPosition }) => calculationPosition === position.id,
        ) ? (
          <TimeEntryForm
            calculationPosition={position}
            recurringTasks={recurringTasks}
            phaseTasks={phaseTasks}
            saveClickedNew={(hours, description) =>
              addEntry(position, hours, description)
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
                        saveClickedUpdate={(hours, description) =>
                          updateEntry(hours, description, entry.id)
                        }
                        deleteClicked={() => deleteEntry(entry.id)}
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
