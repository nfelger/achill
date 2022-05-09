<script>
  import { troiApi } from "./troiApiService";
  import NewTroiEntryFormRow from "./NewTroiEntryFormRow.svelte";

  export let calculationPositionId;
  export let startDate;
  export let endDate;

  let entriesPromise;

  $: {
    entriesPromise = $troiApi.getTimeEntries(
      calculationPositionId,
      startDate,
      endDate
    );
  }

  async function refresh() {
    entriesPromise = $troiApi.getTimeEntries(
      calculationPositionId,
      startDate,
      endDate
    );
  }

  async function deleteEntry(id) {
    await $troiApi.deleteTimeEntryViaServerSideProxy(id);
    refresh();
  }

  function getWeekday(dayIndex) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return weekdays[dayIndex]
  }
</script>

<div>
  <table class="mt-4 min-w-full border-collapse text-sm">
    <thead>
      <tr>
        <th class="w-16 pr-2 pb-2 text-left font-medium"> Date </th>
        <th class="w-8 px-2 pb-2 text-left font-medium"> Hours </th>
        <th class="px-2 pb-2 text-left font-medium"> Description </th>
        <th class="w-14 pl-2 pb-2 text-center font-medium"> Action </th>
      </tr>
    </thead>

    <tbody>
      {#await entriesPromise}
        <p>Loading…</p>
      {:then entries}
        {#each entries as entry}
          <tr class="align-top">
            <td class="py-1 pr-2 min-w-[140px] flex justify-between"><div>{getWeekday(new Date(entry.date).getDay())}</div><div>{entry.date}</div></td>
            <td class="px-2 py-1"
              >{Math.floor(entry.hours)}:{String(
                Math.floor((entry.hours - Math.floor(entry.hours)) * 60)
              ).padStart(2, "0")}</td
            >
            <td class="px-2 py-1">{entry.description}</td>
            <td class="py-1 pl-2"
              ><button
                on:click={() => deleteEntry(entry.id)}
                class="inline-block w-14 text-sm font-medium text-indigo-500 underline hover:text-indigo-700 hover:no-underline"
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      {/await}
      <!-- TODO: work with slots for cell styling -->
      <NewTroiEntryFormRow on:submit={refresh} {calculationPositionId} />
    </tbody>
  </table>
</div>

<style>
  td {
    font-feature-settings: "kern" 1, "tnum" 1;
  }
</style>
