import { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import { TrackyTask } from "~/apis/tasks/TrackyTask";

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

type ProjectTimeDescriptionProps = {
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  phases: TrackyPhase[];
  children: React.ReactNode;
  calculationPositionId: number;
  submitForm: () => void;
  hasErrors: boolean;
  resetErrors: () => void;
  projectTimeId?: number;
};
export default function ProjectTimeDescription({
  description,
  setDescription,
  recurringTasks,
  phaseTasks,
  phases,
  children,
  calculationPositionId,
  submitForm,
  hasErrors,
  resetErrors,
  projectTimeId,
}: ProjectTimeDescriptionProps) {
  const descriptionTestId = `description-${calculationPositionId}`;

  const descriptionSegments = descriptionToSegments(description);

  const phasesToDisplay = phases.map((phase) => ({
    name: phase["Phase Name"],
    open: phaseTasks.some((task) =>
      descriptionSegments.includes([task.name, phase["Phase Name"]].join(" ")),
    ),
  }));

  function addDescriptionSegment(segment: string) {
    resetErrors();
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
        resetErrors();
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

  function handleChipClick(phaseAndTask: string) {
    toggleDescriptionSegment(phaseAndTask);
  }

  function removeChip(phaseAndTask: string) {
    removeDescriptionSegment(phaseAndTask);
  }

  async function onKeyDown(e: React.KeyboardEvent) {
    // allow shift + enter to add newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // dont add newline
      submitForm();
    }
  }

  return (
    <>
      <div className="my-8">
        {recurringTasks && phases.length > 0 && (
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
                    id={`${calculationPositionId}/${projectTimeId}-${task.name}`}
                    value={task.name}
                    type="checkbox"
                    onChange={onRecurringTaskChange}
                  />
                  <label
                    className="pr-5"
                    htmlFor={`${calculationPositionId}/${projectTimeId}-${task.name}`}
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
          <details key={phase.name} className="mb-[20px]" open={phase.open}>
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
              hasErrors ? textareaErrorAppearance : textareaNormalAppearance
            } h-3/5 w-full md:h-full md:w-5/6`}
            placeholder="Working the work…"
          />
        </div>
        <div className="flex flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-2">
          {children}
        </div>
      </div>
    </>
  );
}
