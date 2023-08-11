<script>
  import nocodbApi from "$lib/nocodbClient.js";
  import {onMount} from "svelte";

  export let values = {
    hours: "",
    description: "",
  };

  export let errors = {};
  export let hoursTestId = "hours";
  export let descriptionTestId = "description";
  export let errorTestId = "";
  export let enterPressed;
  export let recurringTasks;
  export let phaseTasks;
  export let position;

  let descriptionSegments = []
  $: localDescription = descriptionSegments.join(", ")

  const inputClass =
    "w-auto basis-3/4 rounded px-1 py-0.5 text-sm placeholder:italic placeholder:text-gray-400";
  const normalAppearance =
    inputClass + "border-1 border-b-[1px] border-gray-300";
  const errorAppearance =
    inputClass +
    "border border-b-2 border-red-500 focus:ring-red-500 focus:border-red-500";

  function onKeyDown(e) {
    if (e.keyCode === 13) {
      enterPressed();
    }
  }

  //TODO: remove string manipulation, replace by reactive description segments array
  let onRecurringTaskChange = (event) => {
    if (event.target.checked) {
      descriptionSegments.push(event.target.id)
      values.description = values.description
              ? values.description + ", " + event.target.id
              : event.target.id;
    } else {
      const index = descriptionSegments.indexOf(event.target.id)
      if (index != -1) descriptionSegments.splice(index, 1)
      if (values.description.startsWith(event.target.id)) {
        if (values.description.length > event.target.id.length) {
          values.description = values.description.replace(
                  event.target.id + ", ",
                  ""
          );
        } else {
          values.description = values.description.replace(event.target.id, "");
        }
      } else if (values.description.includes(event.target.id)) {
        values.description = values.description.replace(
                ", " + event.target.id,
                ""
        );
      }
    }
    console.log(descriptionSegments)
  };

  async function pollPhaseNames(positionId, subprojectId) {
    let whereClause = []
    const phaseIdsForPosition = await nocodbApi.dbViewRow.list("noco", "ds4g-data", "Tracky-Position-Phase", "Tracky-Position-Phase", {
      where: `(Position ID,eq,${positionId})`,
    });
    phaseIdsForPosition.list.forEach( (phaseId) => whereClause.push(`(Phase ID,eq,${phaseId["Phase ID"]})`))

    const phaseIdsForSubproject = await nocodbApi.dbViewRow.list("noco", "ds4g-data", "Tracky-Subproject-Phase", "Tracky-Subproject-Phase", {
      where: `(Subproject ID,eq,${subprojectId})`,
    });
    phaseIdsForSubproject.list.forEach( (phaseId) => whereClause.push(`(Phase ID,eq,${phaseId["Phase ID"]})`))

    return nocodbApi.dbViewRow.list("noco", "ds4g-data", "Tracky-Phase", "Tracky-Phase", {
      where: whereClause.join("~or"),
    });
  }
  let phaseNames

  onMount(async () => {
    phaseNames = (await pollPhaseNames( position.id, position.subproject)).list.map((phase) => phase["Phase Name"])
  })
</script>

<div class="flex">
  <div class="basis-3/4 p-1">
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
    <div class="my-1 flex place-items-center justify-start">
      <label for="hours" class="basis-1/4">Hours</label>
      <input
        bind:value={values.hours}
        on:keydown={onKeyDown}
        type="text"
        id="hours"
        data-testid={hoursTestId}
        class={errors.hours ? errorAppearance : normalAppearance}
        placeholder="2:15"
      />
    </div>
    <div class="mb-4 mt-4">
      {#if recurringTasks}
        <label for="recurring" class="basis-1/4">Ständige Aufgaben</label>
        <div id = "recurring" class="mt-2 space-x-2">
          {#each recurringTasks as entry}
            <input
                    id={entry.name}
                    type="checkbox"
                    on:change={onRecurringTaskChange}
            />
            <label for={entry.name}>{entry.name}</label>
          {/each}
        </div>
      {/if}
    </div>
    <div class="mb-4">
      {#if phaseNames}
          {#each phaseNames as phase}
          <details>
            <summary class="bg-[#E5E5E5] flex flex-row items-center px-[16px] py-[20px] gap-4 w-full mb-[20px] border-solid border-b-2 border-b-[#CED4DA] rounded-t">{phase}</summary>
            {#if phaseTasks}
                {#each phaseTasks as task}
                  <p>{task.name}</p>
                {/each}
              {/if}
          </details>
            
          {/each}
  
      {/if}
    </div>
    <div class="my-1 flex place-items-center justify-start">
      <label for="description" class="basis-1/4">Description</label>
      <textarea
        bind:value={localDescription}
        on:keydown={onKeyDown}
        id="description"
        data-testid={descriptionTestId}
        class={errors.description ? errorAppearance : normalAppearance}
        placeholder="Working the work…"
      />
    </div>
  </div>
</div>