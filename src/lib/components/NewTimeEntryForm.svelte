<script>
    import TimeEntryForm from "$lib/components/EntryForm/TimeEntryForm.svelte";
    import {convertTimeStringToFloat} from "$lib/utils/timeConverter.js";
    import AchillButton from "$lib/components/TroiButton.svelte";
    import {buttonBlue} from "$lib/components/colors.js";
    import {validateForm} from "$lib/components/EntryForm/timeEntryFormValidator.js";
    import nocodbApi from "$lib/nocodbClient.js";
    import {onMount} from "svelte";

    export let position;
    export let recurringTasks;
    export let phaseTasks;
    export let onAddClick;

    let phaseNames = []
    async function pollPhases(tablename, entity, equalsTo) {
        const phases = await nocodbApi.dbViewRow.list("noco", "ds4g-data", tablename, tablename,
            {
                where: `(${entity} ID,eq,${equalsTo})`,
            }
        )
        for (let i = 0; i < phases.list.length; i++) {
            const names = await nocodbApi.dbViewRow.list("noco", "ds4g-data", "Tracky-Phase", "Tracky-Phase",
                {
                    where: `(Phase ID,eq,${phases.list[i]["Phase ID"]})`,
                })
            names.list.forEach((phase) => phaseNames.push(phase["Phase Name"]))
        }
    }


    async function getPhases() {
        // get phases assigned by calculation position
        await pollPhases("Tracky-Position-Phase", "Position", position.id)
        // get phases assigned by subproject
        await pollPhases("Tracky-Subproject-Phase", "Subproject", position.subproject)
    }

    onMount(async () => {
        await getPhases()
    })

    let values = {
        description: "",
        hours: "",
    };
    let errors = {};

    async function handleSubmit() {
        errors = await validateForm(values);

        if (Object.keys(errors).length === 0) {
            const convertedHours = convertTimeStringToFloat(values.hours);
            onAddClick(position, convertedHours, values.description);
            values.hours = "";
            values.description = "";
        }
    }
</script>

<div data-test="entry-form" class="my-2 flex justify-center">
    <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
        <div class="flex flex-col">
            <div class="basis-3/4 p-1">
                <TimeEntryForm
                        {values}
                        {errors}
                        errorTestId={`error-${position.id}`}
                        enterPressed={handleSubmit}
                        hoursTestId={"hours-" + position.id}
                        descriptionTestId={"description-" + position.id}
                />
            </div>
            <div>
                <AchillButton
                        text={"Add"}
                        testId={"add-" + position.id}
                        onClick={handleSubmit}
                        color={buttonBlue}
                />
            </div>
        </div>
    </div>
</div>
