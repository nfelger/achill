<script>
  import NewTroiEntryFormRow from "./NewTroiEntryFormRow.svelte";

  export let calculationPositionId;
  export let startDate;
  export let endDate;
  export let troiApi;

  let entriesPromise;

  $: entriesPromise = troiApi.getTimeEntries(
    calculationPositionId,
    startDate,
    endDate
  );

  async function refresh() {
    entriesPromise = troiApi.getTimeEntries(
      calculationPositionId,
      startDate,
      endDate
    );
  }

  async function deleteEntry(id) {
    await troiApi.deleteTimeEntryViaServerSideProxy(id);
    refresh();
  }
</script>

<div>
  {#await entriesPromise}
    <span>Loading...</span>
  {:then entries}
    <table class="min-w-full mt-4 text-sm border-collapse">
      <thead>
        <tr>
          <th class="pr-2 font-medium pb-2 text-left w-16"> Date </th>
          <th class="px-2 font-medium pb-2 text-left w-8"> Hours </th>
          <th class="px-2 font-medium pb-2 text-left"> Description </th>
          <th class="pl-2 font-medium pb-2 text-center w-14"> Action </th>
        </tr>
      </thead>

      <tbody>
        {#each entries as entry}
          <tr class="align-top">
            <td class="pr-2 py-1">{entry.date}</td>
            <td class="px-2 py-1"
              >{Math.floor(entry.hours)}:{String(
                Math.floor((entry.hours - Math.floor(entry.hours)) * 60)
              ).padStart(2, "0")}</td
            >
            <td class="px-2 py-1">{entry.description}</td>
            <td class="pl-2 py-1"
              ><button
                on:click={() => deleteEntry(entry.id)}
                class="inline-block w-14 text-sm font-medium underline hover:text-indigo-700 hover:no-underline text-indigo-500"
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
        <NewTroiEntryFormRow
          on:submit={refresh}
          {calculationPositionId}
          {troiApi}
        />
      </tbody>
    </table>
  {/await}
</div>

<style>
  td {
    font-feature-settings: "kern" 1, "tnum" 1;
  }
</style>
