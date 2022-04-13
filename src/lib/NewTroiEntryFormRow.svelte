<script>
  import { DateInput } from "date-picker-svelte";
  import moment from "moment";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let calculationPositionId;
  export let troiApi;

  let date;
  let hours;
  let description;

  let submitHandler = async () => {
    if (hours.includes(":")) {
      const [hoursStr, minutesStr] = hours.split(":");
      hours = parseInt(hoursStr) + parseInt(minutesStr) / 60;
    }
    await troiApi.postTimeEntry(
      calculationPositionId,
      moment(date).format("YYYY-MM-DD"),
      hours,
      description
    );
    dispatch("submit");
  };
</script>

<tr>
  <td class="pr-2">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <DateInput
      bind:value={date}
      format="yyyy-MM-dd"
      placeholder="2022-01-01"
      closeOnSelection={true}
    />
  </td>

  <td class="px-2">
    <input
      bind:value={hours}
      type="text"
      id="hours"
      class="w-full border-t-0 border-r-0 border-l-0 border-gray-400 px-0 py-0.5 text-sm placeholder:italic placeholder:text-gray-400"
      placeholder="2:15"
    />
  </td>

  <td class="px-2">
    <input
      bind:value={description}
      type="text"
      id="description"
      class="w-full border-t-0 border-r-0 border-l-0 border-gray-400 px-0 py-0.5 text-sm placeholder:italic placeholder:text-gray-400"
      placeholder="Working the work…"
    />
  </td>

  <td class="pl-2">
    <button
      on:click={submitHandler}
      class="mx-auto block w-12 rounded-sm border border-indigo-600 bg-indigo-600 py-0.5 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
    >
      Add
    </button>
  </td>
</tr>

<style>
  td :global(.date-time-field input) {
    border: none;
    border-bottom-color: rgb(156 163 175);
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-radius: 0;
    color: rgb(31 41 55);
    font-feature-settings: "kern" 1, "tnum" 1;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    padding-left: 0;
    padding-right: 0.5rem;
    --date-input-width: 5.75rem;
  }

  td :global(.date-time-field input::placeholder) {
    color: rgb(156 163 175);
    font-feature-settings: "kern" 1, "tnum" 1;
    font-style: italic;
  }
</style>
