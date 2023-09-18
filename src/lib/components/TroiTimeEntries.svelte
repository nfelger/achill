<script>
  import {
    convertFloatTimeToHHMM,
    convertTimeStringToFloat,
  } from "$lib/utils/timeConverter.js";
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
    position,
    newHours,
    newDescription,
    entry = undefined
  ) {
    if (entry) {
      entry.hours = convertTimeStringToFloat(newHours);
      entry.description = newDescription;
      updateEntry(position, entry);
    } else {
      addEntry(position, convertTimeStringToFloat(newHours), newDescription);
    }
  }
</script>

{#each positions as position}
  <section class="bg-white p-4" data-testid="project-section-{position.id}">
    <div class="container mx-auto pt-4 pb-2">
      {#if !entries[position.id] || entries[position.id].length === 0}
        <TimeEntryForm
          addMode={true}
          {position}
          {recurringTasks}
          {phaseTasks}
          addOrUpdateClicked={(hours, description) =>
            submitEntry(position, hours, description)}
          {disabled}
        />
      {:else}
        {#each entries[position.id] as entry}
          <div data-testid="entryCard-{position.id}">
            <div data-test="entry-form" class="my-2 flex justify-center">
              <div class="block w-full">
                <TimeEntryForm
                  values={{
                    hours: convertFloatTimeToHHMM(entry.hours),
                    description: entry.description,
                  }}
                  {errors}
                  addOrUpdateClicked={(hours, description) =>
                    submitEntry(position, hours, description, entry)}
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
