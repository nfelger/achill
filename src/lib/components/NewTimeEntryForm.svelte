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
                        {recurringTasks}
                        {phaseTasks}
                        {phaseNames}
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
