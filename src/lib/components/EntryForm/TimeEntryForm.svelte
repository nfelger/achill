<script>
  import nocodbApi from "$lib/nocodbClient.js";
  import { onMount } from "svelte";
  import {
    buttonGreen,
    buttonRed,
    buttonBlue,
  } from "$lib/components/colors.js";
  import AchillButton from "$lib/components/TroiButton.svelte";
  import {
    convertFloatTimeToHHMM,
    convertTimeStringToFloat,
  } from "$lib/utils/timeConverter.js";
  import { validateForm } from "../EntryForm/timeEntryFormValidator";

  export let values = {
    hours: "",
    description: "",
  };
  export let errors = {};

  // TODO noci: Find better option to type this function with two parameters
  export let addClicked = (hours, description) => {};
  export let saveClicked = (hours, description) => {};
  export let deleteClicked = () => {};
  export let recurringTasks;
  export let phaseTasks;
  export let position;
  export let disabled;
  export let minRows = 4;
  export let maxRows = 40;

  let errorTestId = `error-${position.id}`;
  let hoursTestId = `hours-${position.id}`;
  let descriptionTestId = `description-${position.id}`;
  let editMode = values.hours === "";

  $: minHeight = `${1 + minRows * 1.2}em`;
  $: maxHeight = maxRows ? `${1 + maxRows * 1.2}em` : `auto`;

  let descriptionSegments =
    values.description !== "" ? [values.description] : [];
  $: description = descriptionSegments.join(", ");

  const inputClass =
    "w-full basis-3/4 rounded px-3 py-2 text-sm placeholder:italic placeholder:text-gray-400 leading-6 ";
  const normalAppearance =
    inputClass + "border-1 border-b-[1px] border-gray-300 ";
  const errorAppearance =
    inputClass +
    "border border-b-2 border-red-500 focus:ring-red-500 focus:border-red-500";
  const textAreaClasses = [
    "inherit border-box absolute top-0 h-full w-full resize-none overflow-hidden p-[0.5em] leading-4",
    errors.description ? errorAppearance : normalAppearance,
  ].join(" ");

  function onKeyDown(e) {
    if (e.keyCode === 13) {
      saveClicked(values.hours, values.description);
    }
  }

  function handleDescriptionChange(event) {
    errors = {};
    description = event.target.value;
    descriptionSegments = event.target.value.split(", ");
  }

  function onRecurringTaskChange(event) {
    if (event.target.checked) {
      descriptionSegments = [...descriptionSegments, event.target.id];
    } else {
      descriptionSegments = descriptionSegments.filter(
        (segment) => segment !== event.target.id
      );
    }
  }

  function handleChipClick(phaseAndTask) {
    if (!descriptionSegments.includes(phaseAndTask)) {
      descriptionSegments = [...descriptionSegments, phaseAndTask];
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
      addClicked(values.hours, values.description);
      values.hours = "";
      values.description = "";
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
    }
  });

  function togglePhase(phase) {
    phase.open = !phase.open;
  }
</script>

<div data-test="entry-form" class="my-2 flex justify-center">
  <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
    <div class="flex flex-col">
      <div class="basis-3/4 p-1">
        <h2
          class="mb-4 text-lg font-semibold text-gray-900"
          title="Position ID: {position.id}"
          data-testid="project-heading-{position.id}"
        >
          {position.name}
        </h2>
        {#if values.hours === "" || editMode}
          <div id="timeEntryForm">
            <div class="flex">
              {#if Object.values(errors).length > 0}
                <div class="basis-1/4" data-testid={errorTestId} />
                <div class="mb-4 font-bold text-red-600">
                  {#each Object.values(errors) as error}
                    {error}
                    <br />
                  {/each}
                </div>
              {/if}
            </div>
            <div class="my-1 place-items-center">
              <label for="hours" class="pr-2">Hours</label>
              <input
                bind:value={values.hours}
                on:keydown={onKeyDown}
                type="text"
                id="hours"
                data-testid={hoursTestId}
                class={`${
                  errors.hours ? errorAppearance : normalAppearance
                } w-1/12`}
                placeholder="2:15"
              />
            </div>
            <div class="my-8">
              {#if recurringTasks && phases}
                <label for="recurring" class="basis-1/4">Recurring tasks</label>
                <div id="recurring" class="mt-2 space-x-1">
                  {#each recurringTasks as entry}
                    <input
                      checked={descriptionSegments.includes(entry.name)
                        ? true
                        : false}
                      class="rounded-md border border-gray-300 bg-white p-2"
                      id={entry.name}
                      type="checkbox"
                      on:change={onRecurringTaskChange}
                    />
                    <label class="pr-5" for={entry.name}>{entry.name}</label>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="mb-4">
              {#if phases}
                {#each phases as phase}
                  <details class="mb-[20px]" bind:open={phase.open}>
                    <summary
                      class="flex h-12 w-full flex-row items-center gap-4 rounded-t border-b-2 border-solid border-b-[#CED4DA] bg-[#E5E5E5] px-[16px] py-[20px]"
                      on:click={() => togglePhase(phase)}
                    >
                      <span>{phase.name}</span>
                      <svg
                        class="ml-auto h-4 w-4 transform transition-transform {phase.open
                          ? 'rotate-180'
                          : ''}"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    {#if phaseTasks}
                      <div
                        class="flex h-auto flex-wrap border-b-2 border-solid border-b-[#CED4DA] bg-white p-2"
                      >
                        {#each phaseTasks as task}
                          <div
                            class="m-2 flex cursor-pointer items-center rounded-full border py-1 px-3 text-sm transition-all duration-150 ease-in-out {descriptionSegments.includes(
                              [task.name, phase.name].join(' ')
                            )
                              ? 'border-black bg-white'
                              : 'bg-[#212121] bg-opacity-10 hover:bg-gray-300'}"
                            on:click={() =>
                              handleChipClick(
                                [task.name, phase.name].join(" ")
                              )}
                          >
                            <span>{task.name}</span>
                            {#if descriptionSegments.includes([task.name, phase.name].join(" "))}
                              <button
                                class="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-800"
                                on:click={(event) => {
                                  event.stopPropagation();
                                  removeChip([task.name, phase.name].join(" "));
                                }}
                              >
                                &#x2715;
                              </button>
                            {/if}
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </details>
                {/each}
              {/if}
            </div>

            <div class="relative mb-4 w-4/6">
              <pre
                aria-hidden="true"
                class="inherit border-box overflow-hidden p-[0.5em] leading-4"
                style="min-height: {minHeight}; max-height: {maxHeight}">{description +
                  "\n"}</pre>

              <textarea
                value={description}
                on:keydown={onKeyDown}
                on:input={handleDescriptionChange}
                id="description"
                data-testid={descriptionTestId}
                class={textAreaClasses}
                placeholder="Working the work…"
              />
            </div>
            {#if !disabled}
              <!-- TODO noci: conditionally render Add OR Cancel and Save Button -->
              <AchillButton
                text={"Cancel"}
                testId={`cancel-${position.id}`}
                onClick={() => {
                  editMode = false;
                }}
                color={buttonRed}
              />
              <AchillButton
                text={"Save"}
                testId={`save-${position.id}`}
                onClick={() => saveClicked(values.hours, values.description)}
                color={buttonGreen}
              />
              <AchillButton
                text={"Add"}
                testId={"add-" + position.id}
                onClick={handleAdd}
                color={buttonBlue}
              />
            {/if}
          </div>
        {:else}
          <div data-testid="entry-card-content">
            <b>{convertFloatTimeToHHMM(values.hours)} Hour(s)</b><br />
            <p>{values.description}</p>
            <br />
            <AchillButton
              text={"Delete"}
              testId={`delete-${position.id}`}
              onClick={() => {
                deleteClicked();
              }}
              color={buttonRed}
            />
            {#if !disabled}
              <AchillButton
                text={"Edit"}
                testId={`edit-${position.id}`}
                onClick={() => {
                  editMode = true;
                }}
                color={buttonBlue}
              />
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
