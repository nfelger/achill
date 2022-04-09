<script>
  import { createEventDispatcher } from "svelte";
  import Input from "./Input.svelte";
  import TroiApiService, { AuthenticationFailed } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  export let userName;
  export let password;
  export let loading = true;

  const dispatch = createEventDispatcher();

  let calculationPositions;
  let today = new Date();
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0");
  let day = String(today.getDate()).padStart(2, "0");
  let startDate = `${year}${month}01`;
  let endDate = `${year}${month}${day}`;

  let troiApi;
  $: {
    troiApi = new TroiApiService(userName, password);
    load();
  }

  export const load = async () => {
    try {
      loading = true;
      await troiApi.initialize();
      calculationPositions = await troiApi.getCalculationPositions();
      loading = false;
      dispatch("finishedLoading");
    } catch (e) {
      if (e instanceof AuthenticationFailed) {
        dispatch("authenticationFailed");
      } else {
        throw e;
      }
    }
  };
</script>

{#if loading}
  <p>Loading…</p>
{:else}
  <section class="bg-white">
    <div class="container pt-4 pb-2  mx-auto">
      <h2 class="text-lg font-bold text-gray-800">Select dates</h2>

      <div class="py-4">
        <label for="startDate">From: </label>
        <Input
          bind:value={startDate}
          name="startDate"
          placeholder="20220101"
          extraClasses="w-28"
        />
        <label for="endData">To: </label>
        <Input
          bind:value={endDate}
          name="endDate"
          placeholder="20220201"
          extraClasses="w-28"
        />
      </div>
    </div>
  </section>

  {#each calculationPositions as calculationPosition}
    <section class="bg-white">
      <div class="container pt-4 pb-2 mx-auto">
        <h2 class="text-lg font-bold text-gray-800">
          {calculationPosition.name}
        </h2>
        <TroiTimeEntries
          calculationPositionId={calculationPosition.id}
          {startDate}
          {endDate}
          {troiApi}
        />
      </div>
    </section>
  {/each}
{/if}
