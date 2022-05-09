<script>
  import { DateInput } from "date-picker-svelte";
  import moment from "moment";
  import { onMount } from "svelte";

  import { troiApi } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  let endDate = new Date();
  let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  let projects = [];

  onMount(async () => {
    projects = await $troiApi.getCalculationPositions();
  });
</script>

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

    <div class="inline-block py-4">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-sm"
        >to:
        <DateInput
          bind:value={endDate}
          format="yyyy-MM-dd"
          closeOnSelection={true}
        />
      </label>
    </div>
  </div>
</section>

{#each projects as project}
  <!-- TODO: make into single component Project -->
  <section class="bg-white">
    <div class="container mx-auto pt-4 pb-2">
      <h2 class="text-lg font-medium">
        {project.name}
      </h2>
      <TroiTimeEntries
        calculationPositionId={project.id}
        startDate={moment(startDate).format("YYYYMMDD")}
        endDate={moment(endDate).format("YYYYMMDD")}
      />
    </div>
  </section>
{:else}
  <p>Loading…</p>
{/each}

<section class="mt-8 text-xs text-gray-600">
  <p>
    Project not showing up? Make sure it's available in Troi and marked as a
    "favorite". <br />
    The "I'm lazy" function is not intended for actual use, it is just a fun feature.
  </p>
</section>

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
