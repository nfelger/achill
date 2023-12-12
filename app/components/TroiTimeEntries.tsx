import { TimeEntry } from "troi-library";
import { Project } from "~/troi/troiController";
import {
  convertFloatTimeToHHMM,
  convertTimeStringToFloat,
} from "~/utils/timeConverter";
import { TimeEntryForm } from "./TimeEntryForm";

interface Props {
  positions: Project[];
  recurringTasks: unknown[];
  phaseTasks: unknown[];
  entries: {
    [projectId: number]: TimeEntry[];
  };
  deleteEntry: (entry: TimeEntry, positionId: number) => unknown;
  updateEntry: (position: Project, entry: TimeEntry) => unknown;
  addEntry: (position: Project, hours: number, description: string) => unknown;
  disabled: boolean;
}

export function TroiTimeEntries({
  positions,
  recurringTasks,
  phaseTasks,
  entries,
  deleteEntry,
  updateEntry,
  addEntry,
  disabled = false,
}: Props) {
  async function submitEntry(
    position: Project,
    newHours: string,
    newDescription: string,
    entry: TimeEntry | undefined = undefined,
  ) {
    if (entry) {
      entry.hours = convertTimeStringToFloat(newHours);
      entry.description = newDescription;
      updateEntry(position, entry);
    } else {
      addEntry(position, convertTimeStringToFloat(newHours), newDescription);
    }
  }

  return positions.map((position) => (
    <section
      className="bg-white p-4"
      data-testid={`project-section-${position.id}`}
    >
      <div className="container mx-auto pb-2 pt-4">
        {!entries[position.id] || entries[position.id].length === 0 ? (
          <TimeEntryForm
            addMode={true}
            position={position}
            recurringTasks={recurringTasks}
            phaseTasks={phaseTasks}
            addOrUpdateClicked={(hours, description) =>
              submitEntry(position, hours, description)
            }
            disabled={disabled}
          />
        ) : (
          entries[position.id].map((entry) => (
            <>
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
                      errors={/*errors*/ {}}
                      addOrUpdateClicked={(hours, description) =>
                        submitEntry(position, hours, description, entry)
                      }
                      deleteClicked={() => deleteEntry(entry, position.id)}
                      recurringTasks={recurringTasks}
                      phaseTasks={phaseTasks}
                      position={position}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>
              <br />
            </>
          ))
        )}
      </div>
    </section>
  ));
}
