import { useEffect, useState } from "react";
import { TrackyButton, buttonRed } from "../common/TrackyButton";
import { TrackyTask } from "~/apis/tasks/TrackyTask";
import { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import { CalculationPosition } from "~/apis/troi/troi.types";
import { useFetcher } from "@remix-run/react";
import { TimeInput } from "../common/TimeInput";
import moment from "moment";
import { projectTimeSaveFormSchema } from "~/utils/projectTimeFormValidator";

export interface ProjectTimeFormErrors {
  hours?: string;
  description?: string;
}
interface Props {
  date: Date;
  projectTimeId?: number;
  values?: {
    hours: string;
    description: string;
  };
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  calculationPosition: CalculationPosition;
  disabled: boolean;
  minRows?: number;
  maxRows?: number;
}

function descriptionToSegments(description: string): string[] {
  return description !== ""
    ? description
        .split(",")
        .map((segment) => segment.trim())
        .filter((segment) => segment !== "")
    : [];
}

function segmentsToDescription(segments: string[]): string {
  return segments.join(", ");
}

export function ProjectTimeForm({
  date,
  projectTimeId,
  values = {
    hours: "04:00",
    description: "",
  },
  recurringTasks,
  phaseTasks,
  calculationPosition,
  disabled,
  minRows = 4,
  maxRows = 40,
}: Props) {
  const hoursTestId = `hours-${calculationPosition.id}`;
  const descriptionTestId = `description-${calculationPosition.id}`;

  const normalAppearance = "border-1 border-b-[1px] border-gray-300 ";
  const errorAppearance =
    "border border-b-2 border-red-500 focus:ring-red-500 focus:border-red-500";

  const textAreaClass =
    "inherit border-box absolute top-0 overflow-hidden p-[0.5em] leading-4 ";
  const textareaNormalAppearance = textAreaClass + normalAppearance;
  const textareaErrorAppearance = textAreaClass + errorAppearance;

  const minHeight = `${1 + minRows * 1.2}em`;
  const maxHeight = maxRows ? `${1 + maxRows * 1.2}em` : `auto`;

  const [description, setDescription] = useState(() => values.description);
  const descriptionSegments = descriptionToSegments(description);
  const [hours, setHours] = useState(values.hours);
  const [updateMode, setUpdateMode] = useState(projectTimeId ? false : true);
  const [errors, setErrors] = useState<ProjectTimeFormErrors>({});

  const troiFetcher = useFetcher({ key: "Troi" });
  const phaseFetcher = useFetcher<TrackyPhase[]>({
    key: `/phases?calculationPositionId=${calculationPosition.id}`,
  });
  useEffect(() => {
    if (phaseFetcher.data == undefined) {
      phaseFetcher.load(
        `/phases?calculationPositionId=${calculationPosition.id}`,
      );
    }
  }, []);

  const phaseNames =
    phaseFetcher.data?.map((phase) => phase["Phase Name"]) ?? [];
  const phases = phaseNames.map((value) => {
    for (const phaseTask of phaseTasks) {
      if (descriptionSegments.includes([phaseTask.name, value].join(" "))) {
        return { name: value, open: true };
      }
    }
    return { name: value, open: false };
  });

  function addDescriptionSegment(segment: string) {
    setDescription((description) =>
      segmentsToDescription([...descriptionToSegments(description), segment]),
    );
  }

  function removeDescriptionSegment(segment: string) {
    setDescription((description) => {
      const segments = descriptionToSegments(description);
      return segmentsToDescription(
        segments.filter((projectTime) => projectTime !== segment),
      );
    });
  }

  function toggleDescriptionSegment(segment: string) {
    if (description.includes(segment)) {
      removeDescriptionSegment(segment);
    } else {
      addDescriptionSegment(segment);
    }
  }

  function removeDuplicatedCommas(description: string) {
    const segments = descriptionToSegments(description);
    return segmentsToDescription(
      segments.filter(
        (projectTime, index) =>
          projectTime !== "" || index === segments.length - 1,
      ),
    );
  }

  function hasDuplicatedCommas(description: string) {
    return description.match(/\,\s*\,/g) !== null;
  }

  function handleDescriptionChange(
    event: React.FormEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.nativeEvent instanceof InputEvent &&
      event.target instanceof HTMLTextAreaElement
    ) {
      if (event.nativeEvent.inputType !== "insertLineBreak") {
        setErrors({});
      }
      let newDescription = event.target.value;
      if (hasDuplicatedCommas(newDescription)) {
        newDescription = removeDuplicatedCommas(newDescription);
      }
      setDescription(newDescription);
    } else {
      console.error("handleDescriptionChange", event);
      // todo throw something
    }
  }

  async function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      submit(projectTimeId ? "PUT" : "POST");
    }
  }

  async function submit(method: "POST" | "PUT" | "DELETE") {
    setErrors({});
    const formData = {
      date: moment(date).format("YYYY-MM-DD"),
      calculationPositionId: calculationPosition.id.toString(),
      hours,
      description,
    };
    const parseResult = projectTimeSaveFormSchema.safeParse(formData);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        const field = issue.path[0];
        setErrors({ ...errors, [field]: issue.message });
      }
      return;
    }
    await troiFetcher.submit(formData, {
      method,
      action: `/project_time/${projectTimeId ?? ""}`,
    });
  }

  function handleCancel() {
    setHours(values.hours);
    setDescription(values.description);
    setUpdateMode(false);
  }

  function onRecurringTaskChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      addDescriptionSegment(event.target.id);
    } else {
      removeDescriptionSegment(event.target.id);
    }
  }

  function handleChipClick(phaseAndTask: string) {
    toggleDescriptionSegment(phaseAndTask);
  }

  function removeChip(phaseAndTask: string) {
    removeDescriptionSegment(phaseAndTask);
  }

  return (
    <div data-test="projectTime-form" className="flex justify-center">
      <div className="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
        <div className="flex flex-col">
          <div className="basis-3/4 p-1">
            <h2
              className="mb-4 text-lg font-semibold text-gray-900"
              title="Position ID: {position.id}"
              data-testid="project-heading-{position.id}"
            >
              {calculationPosition.name}
            </h2>
            {updateMode ? (
              <div id="projectTimeForm">
                <div className="relative flex w-full items-center">
                  <TimeInput
                    name="hours"
                    value={hours}
                    onChangeTime={setHours}
                    label="Hours"
                    // data-testid={hoursTestId}
                  />
                  <div className="mt-1">
                    {Object.values(errors).length > 0 && (
                      <div className="font-bold text-red-600">
                        <ul>
                          {Object.values(errors).map((error) => (
                            <li key={error}>&#x26A0; {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="my-8">
                  {recurringTasks && phases && (
                    <>
                      <label htmlFor="recurring" className="basis-1/4">
                        Recurring tasks
                      </label>
                      <div id="recurring" className="mt-2">
                        {recurringTasks.map((projectTime) => (
                          <div
                            key={projectTime.Id}
                            className="flex items-start space-x-2 md:inline-flex"
                          >
                            <input
                              checked={descriptionSegments.includes(
                                projectTime.name,
                              )}
                              className="rounded-md border border-gray-300 bg-white p-2"
                              id={projectTime.name}
                              type="checkbox"
                              onChange={onRecurringTaskChange}
                            />
                            <label className="pr-5" htmlFor={projectTime.name}>
                              {projectTime.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="mb-4">
                  {phases.map((phase) => (
                    <details
                      key={phase.name}
                      className="mb-[20px]"
                      open={phase.open}
                    >
                      <summary className="flex w-full flex-row items-center gap-4 rounded-t border-b-2 border-solid border-b-[#CED4DA] bg-[#E5E5E5] px-[16px] py-[20px]">
                        <span>{phase.name}</span>
                        <svg
                          className={`ml-auto h-4 w-4 transform transition-transform ${
                            phase.open ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      {phaseTasks && (
                        <div className="flex h-auto flex-wrap border-b-2 border-solid border-b-[#CED4DA] bg-white p-2">
                          {phaseTasks.map((task) => (
                            <div
                              key={task.Id}
                              className={`m-2 flex cursor-pointer items-center rounded-full border py-1 px-3 text-sm transition-all duration-150 ease-in-out ${
                                descriptionSegments.includes(
                                  [task.name, phase.name].join(" "),
                                )
                                  ? "border-black bg-white"
                                  : "bg-[#212121] bg-opacity-10 hover:bg-gray-300"
                              }`}
                              onClick={() =>
                                handleChipClick(
                                  [task.name, phase.name].join(" "),
                                )
                              }
                            >
                              <span>{task.name}</span>
                              {descriptionSegments.includes(
                                [task.name, phase.name].join(" "),
                              ) && (
                                <button
                                  className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-800"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeChip(
                                      [task.name, phase.name].join(" "),
                                    );
                                  }}
                                >
                                  &#x2715;
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
                  ))}
                </div>
                <div className="relative mb-4 flex w-full flex-col items-center justify-between md:flex-row">
                  <div className="mb-2 w-full md:mb-0 md:w-4/6">
                    <pre
                      aria-hidden="true"
                      className="inherit border-box overflow-hidden p-[0.5em] leading-4"
                      style={{ minHeight, maxHeight }}
                    >
                      {description + "\n"}
                    </pre>

                    <textarea
                      name="description"
                      value={description}
                      onKeyDown={onKeyDown}
                      onInput={handleDescriptionChange}
                      id="description"
                      data-testid={descriptionTestId}
                      className={`${
                        errors.description
                          ? textareaErrorAppearance
                          : textareaNormalAppearance
                      } h-3/5 w-full md:h-full md:w-5/6`}
                      placeholder="Working the work…"
                    />
                  </div>
                  <div className="flex flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                    {!disabled && updateMode && (
                      <>
                        {projectTimeId ? (
                          <TrackyButton
                            onClick={() => submit("PUT")}
                            testId={`update-${calculationPosition.id}`}
                          >
                            Update
                          </TrackyButton>
                        ) : (
                          <TrackyButton
                            onClick={() => submit("POST")}
                            testId={`add-${calculationPosition.id}`}
                          >
                            Save
                          </TrackyButton>
                        )}
                        {values.hours && values.description && (
                          <TrackyButton
                            type="reset"
                            onClick={handleCancel}
                            color={buttonRed}
                            testId={`cancel-${calculationPosition.id}`}
                          >
                            Cancel
                          </TrackyButton>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div data-testid="projectTime-card-content">
                <b>{values.hours} Hour(s)</b>
                <br />
                <p>{values.description}</p>
                <br />
                <div className="flex flex-row space-x-2">
                  <TrackyButton
                    onClick={() => submit("DELETE")}
                    color={buttonRed}
                    testId={`delete-${calculationPosition.id}`}
                  >
                    Delete
                  </TrackyButton>
                  {!disabled && (
                    <TrackyButton
                      type="button"
                      onClick={() => {
                        // openPhases();
                        setUpdateMode(true);
                      }}
                      testId={`edit-${calculationPosition.id}`}
                    >
                      Edit
                    </TrackyButton>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
