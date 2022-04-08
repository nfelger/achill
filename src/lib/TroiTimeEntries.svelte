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

<div class="overflow-x-auto">
  {#await entriesPromise}
    <span>Loading...</span>
  {:then entries}
    <table class="min-w-full mt-4 text-sm divide-y-2 divide-gray-200">
      <thead>
        <tr>
          {#each ["Date", "Hours worked", "Description", "Action"] as title}
            <th
              class="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap"
            >
              {title}
            </th>
          {/each}
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200">
        {#each entries as entry}
          <tr>
            <td class="px-4 py-2 text-gray-900 whitespace-nowrap"
              >{entry.date}</td
            >
            <td class="px-4 py-2 text-gray-700 whitespace-nowrap"
              >{entry.hours}</td
            >
            <td class="px-4 py-2 text-gray-700 whitespace-nowrap"
              >{entry.description}</td
            ><button
              on:click={() => deleteEntry(entry.id)}
              class="inline-block rounded border border-indigo-600 bg-white px-2 py-1 text-sm font-medium hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring text-indigo-500"
            >
              Delete
            </button>
            <td />
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
