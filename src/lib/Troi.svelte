<script>
  import { user, login_complete, login_fail } from "../lib/auth.js";
  import { DateInput } from "date-picker-svelte";

  import TroiApiService, { AuthenticationFailed } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  export let loading = true;

  const dateFormat = (date) => {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  let calculationPositions;
  let endDate = new Date();
  let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  let troiApi;
  $: {
    troiApi = new TroiApiService($user.name, $user.password);
    load();
  }

  export const load = async () => {
    try {
      loading = true;
      await troiApi.initialize();
      calculationPositions = await troiApi.getCalculationPositions();
      loading = false;
      login_complete();
    } catch (e) {
      if (e instanceof AuthenticationFailed) {
        login_fail();
      } else {
        throw e;
      }
    }
  };
</script>

{#if loading}
  <p>Loading…</p>
{:else}
  <section>
    <div class="flex gap-4">
      <div class="py-4">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="text-sm"
          >Show from:
          <DateInput
            bind:value={startDate}
            format="yyyy-MM-dd"
            closeOnSelection={true}
          />
        </label>
      </div>

      <div class="py-4 inline-block">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="text-sm"
          >To:
          <DateInput
            bind:value={endDate}
            format="yyyy-MM-dd"
            closeOnSelection={true}
          />
        </label>
      </div>
    </div>
  </section>

  {#each calculationPositions as calculationPosition}
    <section class="bg-white">
      <div class="container pt-4 pb-2 mx-auto">
        <h2 class="text-lg font-medium">
          {calculationPosition.name}
        </h2>
        <TroiTimeEntries
          calculationPositionId={calculationPosition.id}
          startDate={dateFormat(startDate)}
          endDate={dateFormat(endDate)}
          {troiApi}
        />
      </div>
    </section>
  {/each}
{/if}

<style>
  div :global(.date-time-field input) {
    color: rgb(31 41 55);
    font-feature-settings: "kern" 1, "tnum" 1;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  :root {
    --date-input-width: 6.5rem;
  }
</style>
