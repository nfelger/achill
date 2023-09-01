<script>
  import { convertFloatTimeToHHMM } from "$lib/utils/timeConverter.js";
  import TimeEntryForm from "$lib/components/EntryForm/TimeEntryForm.svelte";

  export let positions;
  export let recurringTasks;
  export let phaseTasks;
  export let entries;
  export let deleteEntry;
  export let updateEntry;
  export let addEntry;
  export let disabled = false;

  let errors = {};

  async function submitEntry(
    projectId,
    entry = undefined,
    newDescription,
    newHours
  ) {
    console.log(projectId, entry, newDescription, newHours);
    if (entry) {
      console.log(typeof newHours);
      // TODO noci: TypeError: Cannot create property 'hours' on number
      entry.hours = convertFloatTimeToHHMM(newHours);
      entry.description = newDescription;
      updateEntry(projectId, entry);
    } else {
      addEntry(projectId, newHours, newDescription);
    }
  }
</script>

{#each positions as position}
  <section class="bg-white p-4">
    <div class="container mx-auto pt-4 pb-2">
      {#if !entries[position.id] || entries[position.id].length === 0}
        <TimeEntryForm
          {position}
          {recurringTasks}
          {phaseTasks}
          addClicked={(hours, description) =>
            submitEntry(position.id, hours, description)}
          {disabled}
        />
      {:else}
        {#each entries[position.id] as entry}
          <div data-testid="entryCard-{position.id}">
            <div data-test="entry-form" class="my-2 flex justify-center">
              <div class="block w-full">
                <TimeEntryForm
                  values={{
                    hours: entry.hours,
                    description: entry.description,
                  }}
                  {errors}
                  saveClicked={(hours, description) =>
                    submitEntry(position.id, entry, hours, description)}
                  deleteClicked={() => deleteEntry(entry, position.id)}
                  {recurringTasks}
                  {phaseTasks}
                  {position}
                  {disabled}
                />
              </div>
            </div>
          </div>
          <br />
        {/each}
      {/if}
    </div>
  </section>
{/each}
