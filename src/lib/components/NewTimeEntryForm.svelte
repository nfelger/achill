<script>
    import TimeEntryForm from "$lib/components/EntryForm/TimeEntryForm.svelte";
    import {convertTimeStringToFloat} from "$lib/utils/timeConverter.js";
    import AchillButton from "$lib/components/TroiButton.svelte";
    import {buttonBlue} from "$lib/components/colors.js";
    import {validateForm} from "$lib/components/EntryForm/timeEntryFormValidator.js";

    export let position;
    export let recurringTasks;
    export let phaseTasks;
    export let onAddClick;


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
                <TimeEntryForm
                        {values}
                        {errors}
                        errorTestId={`error-${position.id}`}
                        enterPressed={handleSubmit}
                        hoursTestId={"hours-" + position.id}
                        descriptionTestId={"description-" + position.id}
                        {recurringTasks}
                        {phaseTasks}
                        {position}
                />
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
