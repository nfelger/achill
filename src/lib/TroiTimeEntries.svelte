<script>
  import { troiApi } from "./troiApiService";
  import NewTroiEntryFormRow from "./NewTroiEntryFormRow.svelte";
  import { onMount } from 'svelte';

  export let calculationPositionId;
  export let startDate;
  export let endDate;

  let entries = [];
  let editEntryIndex;

  onMount(async () => {
    entries = await $troiApi.getTimeEntries(
            calculationPositionId,
            startDate,
            endDate
    );
  });

  async function refresh() {
    entries = await $troiApi.getTimeEntries(
      calculationPositionId,
      startDate,
      endDate
    );
  }

  async function deleteEntry(id) {
    await $troiApi.deleteTimeEntryViaServerSideProxy(id);
    refresh();
  }

  async function editEntry(index) {
    editEntryIndex = index;
  }

  async function cancelEdit() {
    editEntryIndex = null;
  }

  function getWeekday(dayIndex) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[dayIndex];
  }
</script>

<div>
  <table class="mt-4 min-w-full border-collapse text-sm">
    <thead>
      <tr>
        <th class="w-16 pr-2 pb-2 text-left font-medium"> Date </th>
        <th class="w-8 px-2 pb-2 text-left font-medium"> Hours </th>
        <th class="px-2 pb-2 text-left font-medium"> Description </th>
        <th class="w-14 pl-2 pb-2 text-center font-medium"> Actions </th>
      </tr>
    </thead>

    <tbody>
      {#each entries as entry, index}
        {#if editEntryIndex === index}
          <NewTroiEntryFormRow on:submit={refresh} on:cancelEdit={cancelEdit} {calculationPositionId} entry={entry} editMode={true} deleteEntryCallback={deleteEntry} />
        {:else}
          <tr class="align-top">
            <td class="py-1 pr-2 min-w-[140px] flex justify-between"
              ><div>{getWeekday(new Date(entry.date).getDay())}</div>
              <div>{entry.date}</div></td
            >
            <td class="px-2 py-1"
            >{Math.floor(entry.hours)}:{String(
                    Math.floor((entry.hours - Math.floor(entry.hours)) * 60)
            ).padStart(2, "0")}</td
            >
            <td class="px-2 py-1">{entry.description}</td>
            <td class="py-1 pl-2 flex"
            >
              <button
                      on:click={() => editEntry(index)}
                      class="inline-block w-14 text-sm font-medium text-indigo-500 underline hover:text-indigo-700 hover:no-underline"
              >
                Edit
              </button>
              <button
                      on:click={() => deleteEntry(entry.id)}
                      class="inline-block text-sm font-medium text-indigo-500 underline hover:text-indigo-700 hover:no-underline"
              >
                Delete
              </button>
            </td>
          </tr>
        {/if}
      {/each}
      {#if editEntryIndex == null}
        <!-- TODO: work with slots for cell styling -->
        <NewTroiEntryFormRow on:submit={refresh} {calculationPositionId} />
      {/if}
    </tbody>
  </table>
</div>

<style>
  td {
    font-feature-settings: "kern" 1, "tnum" 1;
  }
</style>
