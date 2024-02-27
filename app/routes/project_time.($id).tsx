import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { ZodError } from "zod";
import { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import { TrackyTask } from "~/apis/tasks/TrackyTask";
import type { CalculationPosition, ProjectTime } from "~/apis/troi/Troi.types";
import {
  addProjectTime,
  deleteProjectTime,
  updateProjectTime,
} from "~/apis/troi/TroiApiController";
import { TimeInput } from "~/components/common/TimeInput";
import { TrackyButton, buttonRed } from "~/components/common/TrackyButton";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { projectTimeSaveFormSchema } from "~/utils/projectTimeFormValidator";

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);
  const formData = await request.formData();
  const formDataObject = Object.fromEntries(formData.entries());

  try {
    switch (formDataObject._action) {
      case "POST": {
        const parsedData = projectTimeSaveFormSchema.parse(formDataObject);
        return await addProjectTime(session, parsedData);
      }
      case "PUT": {
        if (params.id === undefined) {
          throw new Response("ProjectTime ID is required.", { status: 400 });
        }
        const id = parseInt(params.id);
        const parsedData = projectTimeSaveFormSchema.parse(formDataObject);
        return await updateProjectTime(session, id, parsedData);
      }
      case "DELETE": {
        if (params.id === undefined) {
          throw new Response("ProjectTime ID is required.", { status: 400 });
        }
        const id = parseInt(params.id);
        return await deleteProjectTime(session, id);
      }
      default:
        throw new Response("Method Not Allowed", { status: 405 });
    }
  } catch (e) {
    if (e instanceof ZodError) {
      return json(e, { status: 422 });
    }
    if (e instanceof Error && e.message === "Invalid credentials") {
      console.error("Troi auth failed", e);
      throw redirect("/login");
    }
    throw e;
  }
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

const normalAppearance = "border-1 border-b-[1px] border-gray-300 ";
const errorAppearance =
  "border border-b-2 border-red-500 focus:ring-red-500 focus:border-red-500";

const textAreaClass =
  "inherit border-box absolute top-0 overflow-hidden p-[0.5em] leading-4 ";
const textareaNormalAppearance = textAreaClass + normalAppearance;
const textareaErrorAppearance = textAreaClass + errorAppearance;

const minRows = 4;
const maxRows = 40;
const minHeight = `${1 + minRows * 1.2}em`;
const maxHeight = maxRows ? `${1 + maxRows * 1.2}em` : `auto`;

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
  phases: TrackyPhase[];
  calculationPosition: CalculationPosition;
  disabled: boolean;
  onAddProjectTime?: (projectTime: ProjectTime) => void;
  onUpdateProjectTime?: (projectTime: ProjectTime) => void;
  onDeleteProjectTime?: (projectTimeId: number) => void;
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
  phases,
  calculationPosition,
  disabled,
  onAddProjectTime,
  onUpdateProjectTime,
  onDeleteProjectTime,
}: Props) {
  const fetcher = useFetcher<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  const [description, setDescription] = useState(() => values.description);
  const descriptionSegments = descriptionToSegments(description);
  const [hours, setHours] = useState(
    moment(values.hours, "HH:mm").format("HH:mm"),
  );
  const [isEdit, setIsEdit] = useState(projectTimeId ? false : true);
  const [errors, setErrors] = useState<ProjectTimeFormErrors>({});

  const descriptionTestId = `description-${calculationPosition.id}`;

  const phasesToDisplay = phases.map((phase) => ({
    name: phase["Phase Name"],
    open: phaseTasks.some((task) =>
      descriptionSegments.includes([task.name, phase["Phase Name"]].join(" ")),
    ),
  }));

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

  function onRecurringTaskChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      addDescriptionSegment(event.target.value);
    } else {
      removeDescriptionSegment(event.target.value);
    }
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

  function handleCancel() {
    setHours(values.hours);
    setDescription(values.description);
    setIsEdit(false);
  }

  function handleChipClick(phaseAndTask: string) {
    toggleDescriptionSegment(phaseAndTask);
  }

  function removeChip(phaseAndTask: string) {
    removeDescriptionSegment(phaseAndTask);
  }

  async function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && formRef.current) {
      formRef.current.submit();
    }
  }

  useEffect(() => {
    if (fetcher.state !== "loading" || !fetcher.data) return;
    if ("issues" in fetcher.data) {
      console.log("fetcher.data.issues", fetcher.data.issues);
      fetcher.data.issues.forEach((issue: any) => {
        const field = issue.path[0];
        setErrors({ ...errors, [field]: issue.message });
      });
      return;
    } else if (fetcher.data.id && fetcher.formData) {
      const submittedProjectTime = fetcher.data;

      switch (fetcher.formData.get("_action")) {
        case "POST":
          onAddProjectTime!(submittedProjectTime as ProjectTime);
          break;
        case "PUT":
          onUpdateProjectTime!(submittedProjectTime as ProjectTime);
          setIsEdit(false);
          break;
        case "DELETE":
          onDeleteProjectTime!(submittedProjectTime.id);
          break;
        default:
          break;
      }
    }
  }, [fetcher.state]);

  return (
    <fetcher.Form
      ref={formRef}
      method="POST"
      action={`/project_time/${projectTimeId ?? ""}`}
      data-test="projectTime-form"
      className="block w-full rounded-lg bg-gray-100 p-4 shadow-lg"
    >
      <input
        type="hidden"
        name="calculationPositionId"
        value={calculationPosition.id}
      />
      <input
        type="hidden"
        name="date"
        value={moment(date).format("YYYY-MM-DD")}
      />
      <div className="flex flex-col">
        <div className="basis-3/4">
          <h3
            className="mb-4 text-gray-900"
            title="Position ID: {position.id}"
            data-testid="project-heading-{position.id}"
          >
            {calculationPosition.name}
          </h3>
          {isEdit ? (
            <div id="projectTimeForm">
              <div className="relative flex w-full items-center">
                <TimeInput
                  name="hours"
                  time={hours}
                  onChange={setHours}
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
                      {recurringTasks.map((task) => (
                        <div
                          key={task.Id}
                          className="flex items-start space-x-2 md:inline-flex"
                        >
                          <input
                            checked={descriptionSegments.includes(task.name)}
                            className="rounded-md border border-gray-300 bg-white p-2"
                            id={`${calculationPosition.id}-${task.name}`}
                            value={task.name}
                            type="checkbox"
                            onChange={onRecurringTaskChange}
                          />
                          <label
                            className="pr-5"
                            htmlFor={`${calculationPosition.id}-${task.name}`}
                          >
                            {task.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="mb-4">
                {phasesToDisplay.map((phase) => (
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
                              handleChipClick([task.name, phase.name].join(" "))
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
                                  removeChip([task.name, phase.name].join(" "));
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
              <div className="relative flex w-full flex-col items-center justify-between md:flex-row">
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
                  {!disabled && isEdit && (
                    <>
                      {projectTimeId ? (
                        <TrackyButton
                          name="_action"
                          value="PUT"
                          testId={`update-${calculationPosition.id}`}
                        >
                          Update
                        </TrackyButton>
                      ) : (
                        <TrackyButton
                          name="_action"
                          value="POST"
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
                  name="_action"
                  value="DELETE"
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
                      setIsEdit(true);
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
    </fetcher.Form>
  );
}
