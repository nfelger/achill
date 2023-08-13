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

    let descriptionSegments = values.description !== "" ? [values.description]: []
    $: description = descriptionSegments.join(", ");


    const inputClass =
        "w-full basis-3/4 rounded px-3 py-2 text-sm placeholder:italic placeholder:text-gray-400 leading-6 ";
    const normalAppearance =
        inputClass + "border-1 border-b-[1px] border-gray-300 ";
    const errorAppearance =
        inputClass +
        "border border-b-2 border-red-500 focus:ring-red-500 focus:border-red-500 ";

    function onKeyDown(e) {
        if (e.keyCode === 13) {
            enterPressed();
        }
    }

    function handleDescriptionChange(event) {
        descriptionSegments = event.target.value.split(", ");
    }

    function onRecurringTaskChange(event) {
        if (event.target.checked) {
            descriptionSegments = [...descriptionSegments, event.target.id]
        } else {
            descriptionSegments = descriptionSegments.filter(segment => segment !== event.target.id);
        }
    };

    function handleChipClick(phaseAndTask) {
        if (!descriptionSegments.includes(phaseAndTask)) {
            descriptionSegments = [...descriptionSegments, phaseAndTask]
        }
    }

    function removeChip(phaseAndTask) {
        descriptionSegments = descriptionSegments.filter(segment => segment !== phaseAndTask);
    }

    async function pollPhaseNames(positionId, subprojectId) {
        let whereClause = []
        const phaseIdsForPosition = await nocodbApi.dbViewRow.list("noco", "ds4g-data", "Tracky-Position-Phase", "Tracky-Position-Phase", {
            where: `(Position ID,eq,${positionId})`,
        });
        phaseIdsForPosition.list.forEach((phaseId) => whereClause.push(`(Phase ID,eq,${phaseId["Phase ID"]})`))

        const phaseIdsForSubproject = await nocodbApi.dbViewRow.list("noco", "ds4g-data", "Tracky-Subproject-Phase", "Tracky-Subproject-Phase", {
            where: `(Subproject ID,eq,${subprojectId})`,
        });
        phaseIdsForSubproject.list.forEach((phaseId) => whereClause.push(`(Phase ID,eq,${phaseId["Phase ID"]})`))

        return nocodbApi.dbViewRow.list("noco", "ds4g-data", "Tracky-Phase", "Tracky-Phase", {
            where: whereClause.join("~or"),
        });
    }

    let phases

    onMount(async () => {
        const phaseNames = (await pollPhaseNames(position.id, position.subproject)).list.map((phase) => phase["Phase Name"])
        phases = phaseNames.map(value => ({name: value, open: false}));
    })

    function togglePhase(phase) {
        phase.open = !phase.open;
    }
</script>

<div>
    <div class="flex">
        {#if Object.values(errors).length > 0}
            <div class="basis-1/4" data-testid={errorTestId}/>
            <div class="mb-4 font-bold text-red-600">
                {#each Object.values(errors) as error}
                    {error}
                    <br/>
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
                class={`${errors.hours ? errorAppearance : normalAppearance} w-1/12`}
                placeholder="2:15"
        />
    </div>
    <div class="mb-4 mt-4">
        {#if recurringTasks}
            <label for="recurring" class="basis-1/4">Recurring tasks</label>
            <div id="recurring" class="mt-2 space-x-1">
                {#each recurringTasks as entry}
                    <input class="bg-white border border-gray-300 rounded-md p-2"
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
                            class="h-12 flex items-center bg-[#E5E5E5] flex-row px-[16px] py-[20px] gap-4 w-full border-solid border-b-2 border-b-[#CED4DA] rounded-t"
                            on:click={() => togglePhase(phase)}>
                        <span>{phase.name}</span>
                        <svg class="w-4 h-4 ml-auto transition-transform transform {phase.open ? 'rotate-180' : ''}"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </summary>
                    {#if phaseTasks}
                        <div class="flex flex-wrap bg-white border-solid border-b-2 border-b-[#CED4DA] h-auto">
                            {#each phaseTasks as task}
                                <div class="m-4 py-1 px-3 rounded-full text-sm cursor-pointer flex items-center transition-all duration-150 ease-in-out border {descriptionSegments.includes([task.name, phase.name].join(' ')) ? 'bg-white border-black' : 'hover:bg-gray-300 bg-[#E5E5E5]'}"
                                        on:click={() => handleChipClick([task.name, phase.name].join(' '))}>
                                    <span>{task.name}</span>
                                    {#if descriptionSegments.includes([task.name, phase.name].join(' '))}
                                        <button class="ml-2 text-white bg-gray-600 hover:bg-gray-800 rounded-full w-4 h-4 flex items-center justify-center"
                                                on:click={event => {event.stopPropagation();removeChip([task.name, phase.name].join(' '));}}>
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
    <div class="w-4/6 mb-4">
            <textarea
                    bind:value={description}
                    on:keydown={onKeyDown}
                    on:input={handleDescriptionChange}
                    id="description"
                    data-testid={descriptionTestId}
                    class={errors.description ? errorAppearance : normalAppearance}
                    placeholder="Working the work…"
            />
    </div>
</div>