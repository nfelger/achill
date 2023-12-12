import { Project } from "~/troi/troiController";
import { useEffect, useState } from "react";

/*
function onRecurringTaskChange(event) {
  if (event.target.checked) {
    descriptionSegments = [...descriptionSegments, event.target.id].filter(
      (f) => f !== ""
    );
  } else {
    descriptionSegments = descriptionSegments.filter(
      (segment) => segment !== event.target.id
    );
  }
}

function handleChipClick(phaseAndTask) {
  if (!descriptionSegments.includes(phaseAndTask)) {
    descriptionSegments = [...descriptionSegments, phaseAndTask].filter(
      (f) => f !== ""
    );
  }
}

function removeChip(phaseAndTask) {
  descriptionSegments = descriptionSegments.filter(
    (segment) => segment !== phaseAndTask
  );
}

async function handleAdd() {
  values.description = description;
  errors = await validateForm(values);
  if (Object.keys(errors).length === 0) {
    addOrUpdateClicked(values.hours, values.description);
    values.hours = "";
    values.description = "";
  }
}

async function handleUpdate() {
  values.description = description;
  errors = await validateForm(values);

  if (Object.keys(errors).length === 0) {
    addOrUpdateClicked(values.hours, values.description);
    values.hours = "";
    values.description = "";

    // TODO noci: do like with handleAdd
    setTimeout(() => {
      updateMode = false;
      phases.forEach((phase) => (phase.open = false));
    }, 2000);
  }
}

async function pollPhaseNames(positionId, subprojectId) {
  let whereClause = [];
  const phaseIdsForPosition = await nocodbApi.dbViewRow.list(
    "noco",
    "ds4g-data",
    "Tracky-Position-Phase",
    "Tracky-Position-Phase",
    {
      where: `(Position ID,eq,${positionId})`,
    }
  );
  phaseIdsForPosition.list.forEach((phaseId) =>
    whereClause.push(`(Phase ID,eq,${phaseId["Phase ID"]})`)
  );

  const phaseIdsForSubproject = await nocodbApi.dbViewRow.list(
    "noco",
    "ds4g-data",
    "Tracky-Subproject-Phase",
    "Tracky-Subproject-Phase",
    {
      where: `(Subproject ID,eq,${subprojectId})`,
    }
  );
  phaseIdsForSubproject.list.forEach((phaseId) =>
    whereClause.push(`(Phase ID,eq,${phaseId["Phase ID"]})`)
  );

  if (whereClause.length > 0) {
    return nocodbApi.dbViewRow.list(
      "noco",
      "ds4g-data",
      "Tracky-Phase",
      "Tracky-Phase",
      {
        where: whereClause.join("~or"),
      }
    );
  }
}

let phases;

onMount(async () => {
  const phaseNames = await pollPhaseNames(position.id, position.subproject);
  if (phaseNames) {
    phases = phaseNames.list
      .map((phase) => phase["Phase Name"])
      .map((value) => ({ name: value, open: false }));
    openPhases();
  }
});

function togglePhase(phase) {
  phase.open = !phase.open;
}

function openPhases() {
  for (const phase of phases) {
    for (const phaseTask of phaseTasks) {
      if (
        descriptionSegments.includes([phaseTask.name, phase.name].join(" "))
      ) {
        phase.open = true;
        break;
      }
    }
  }
}*/

interface Props {
  values?: {
    hours: string;
    description: string;
  };
  errors?: {
    hours?: unknown;
    description?: unknown;
  };
  addOrUpdateClicked: (hours: string, description: string) => unknown;
  deleteClicked?: () => unknown;
  recurringTasks: unknown[];
  phaseTasks: unknown[];
  position: Project;
  disabled: boolean;
  minRows?: number;
  maxRows?: number;
  addMode?: boolean;
  updateMode?: boolean;
}

export function TimeEntryForm({
  values = {
    hours: "",
    description: "",
  },
  errors = {},
  addOrUpdateClicked,
  deleteClicked,
  recurringTasks,
  phaseTasks,
  position,
  disabled,
  minRows = 4,
  maxRows = 40,
  addMode = false,
  updateMode = false,
}: Props) {
  const hoursTestId = `hours-${position.id}`;
  const descriptionTestId = `description-${position.id}`;

  const normalAppearance = "border-1 border-b-[1px] border-gray-300 ";
  const errorAppearance =
    "border border-b-2 border-red-500 focus:ring-red-500 focus:border-red-500";

  const inputClass =
    "w-full basis-3/4 rounded px-3 py-2 text-sm placeholder:italic placeholder:text-gray-400 leading-6 ";
  const inputNormalAppearance = inputClass + normalAppearance;
  const inputErrorAppearance = inputClass + errorAppearance;

  const textAreaClass =
    "inherit border-box absolute top-0 overflow-hidden p-[0.5em] leading-4 ";
  const textareaNormalAppearance = textAreaClass + normalAppearance;
  const textareaErrorAppearance = textAreaClass + errorAppearance;

  const minHeight = `${1 + minRows * 1.2}em`;
  const maxHeight = maxRows ? `${1 + maxRows * 1.2}em` : `auto`;

  const [descriptionSegments, setDescriptionSegments] = useState(() =>
    values.description !== "" ? values.description.split(", ") : [],
  );
  const [description, setDescription] = useState(() =>
    descriptionSegments.join(", "),
  );

  useEffect(() => {
    setDescription(descriptionSegments.join(", "));
  }, [descriptionSegments]);

  async function onKeyDown(e) {
    if (e.keyCode === 13) {
      /*errors = await validateForm({
        hours: values.hours,
        description: description,
      });*/
      if (Object.keys(errors).length === 0) {
        addOrUpdateClicked(values.hours, values.description);
        values.hours = "";
        values.description = "";
      }
    }
  }

  function handleDescriptionChange(
    event: React.FormEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.nativeEvent instanceof InputEvent &&
      event.target instanceof HTMLTextAreaElement
    ) {
      if (event.nativeEvent.inputType !== "insertLineBreak") {
        errors = {};
      }
      if (
        event.nativeEvent.inputType === "deleteContentBackward" &&
        description.charAt(description.length - 1) === " "
      ) {
        setDescription(event.target.value);
      } else {
        setDescription(event.target.value);
        if (event.nativeEvent.data !== " ") {
          setDescriptionSegments(
            event.target.value.split(",").map((value) => value.trim()),
          );
        }
      }
      const indexEmptyEntry = descriptionSegments.indexOf("");
      if (
        indexEmptyEntry !== -1 &&
        indexEmptyEntry !== descriptionSegments.length - 1
      ) {
        setDescriptionSegments(
          descriptionSegments.filter(
            (entry, index) =>
              entry !== "" || index === descriptionSegments.length - 1,
          ),
        );
      }
    } else {
      console.error("handleDescriptionChange", event);
      // todo throw something
    }
  }

  return (
    <div data-test="entry-form" className="my-2 flex justify-center">
      <div className="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
        <div className="flex flex-col">
          <div className="basis-3/4 p-1">
            <h2
              className="mb-4 text-lg font-semibold text-gray-900"
              title="Position ID: {position.id}"
              data-testid="project-heading-{position.id}"
            >
              {position.name}
            </h2>
            {addMode || updateMode ? (
              <div id="timeEntryForm">
                <div className="relative flex w-full items-center">
                  <div>
                    <label htmlFor="hours" className="pr-2">
                      Hours
                    </label>
                    <input
                      value={values.hours}
                      onKeyDown={onKeyDown}
                      type="text"
                      id="hours"
                      data-testid={hoursTestId}
                      className={`${
                        errors.hours
                          ? inputErrorAppearance
                          : inputNormalAppearance
                      } w-3/12`}
                      placeholder="2:15"
                    />
                  </div>
                  <div className="mt-1"></div>
                </div>
                <div className="my-8"></div>
                <div className="mb-4"></div>
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
                  <div className="flex flex-row space-x-2 md:flex-col md:space-y-2"></div>
                </div>
              </div>
            ) : (
              <div data-testid="entry-card-content">
                <b>{values.hours} Hour(s)</b>
                <br />
                <p>{values.description}</p>
                <br />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
