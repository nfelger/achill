import {
  convertFloatTimeToHHMM,
  convertTimeStringToFloat,
} from "~/utils/timeConverter";
import { TimeEntryForm } from "./TimeEntryForm";
import { TrackyTask } from "~/tasks/useTasks";
import { Fragment } from "react";
import { CalculationPosition } from "~/troi/CalculationPosition";
import { TimeEntry } from "~/troi/TimeEntry";

interface Props {
  calculationPositions: CalculationPosition[];
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  entries: TimeEntry[];
  deleteEntry: (entry: TimeEntry) => unknown;
  updateEntry: (entry: TimeEntry) => unknown;
  addEntry: (
    position: CalculationPosition,
    hours: number,
    description: string,
  ) => unknown;
  disabled: boolean;
}

export function TroiTimeEntries({
  calculationPositions,
  recurringTasks,
  phaseTasks,
  entries,
  deleteEntry,
  updateEntry,
  addEntry,
  disabled = false,
}: Props) {
  async function submitEntry(
    position: CalculationPosition,
    newHours: string,
    newDescription: string,
    entry: TimeEntry | undefined = undefined,
  ) {
    if (entry) {
      entry.hours = convertTimeStringToFloat(newHours);
      entry.description = newDescription;
      updateEntry(entry);
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
      <div className="container mx-auto pb-2 pt-4">
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
