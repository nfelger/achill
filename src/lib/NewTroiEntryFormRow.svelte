<script>
  export let calculationPositionId;
  export let troiApi;

  let date;
  let hours;
  let description;

  let submitHandler = async () => {
    troiApi.postTimeEntry(calculationPositionId, date, hours, description);
  };
</script>

<tr>
  <td class="px-2">
    <input
      bind:value={date}
      type="text"
      id="date"
      class="w-full rounded-lg border-gray-200 px-2 py-1 text-sm shadow-sm"
      placeholder="2022-01-01"
    />
  </td>

  <td class="px-2">
    <input
      bind:value={hours}
      type="text"
      id="hours"
      class="w-full rounded-lg border-gray-200 px-2 py-1 text-sm shadow-sm"
      placeholder="2.25"
    />
  </td>

  <td class="px-2">
    <input
      bind:value={description}
      type="text"
      id="description"
      class="w-full rounded-lg border-gray-200 px-2 py-1 text-sm shadow-sm"
      placeholder="Working the work"
    />
  </td>

  <td>
    <button
      on:click={submitHandler}
      class="inline-block rounded border border-indigo-600 bg-indigo-600 px-2 py-1 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
    >
      Add
    </button>
  </td>
</tr>
