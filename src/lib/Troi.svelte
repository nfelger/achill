<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import { troiApi } from "$lib/apis/troiApiService";
  import TroiTimeEntries from "$lib/components/TroiTimeEntries.svelte";
  import WeekView from "$lib/components/WeekView.svelte";
  import LoadingOverlay from "$lib/components/LoadingOverlay.svelte";
  import { getWeekDaysFor } from "$lib/utils/dateUtils";
  import InfoBanner from "$lib/components/InfoBanner.svelte";
  import TroiController from "$lib/troiController";
  import nocodbApi from "./nocodbClient";
  import { CalendarEventType } from "$lib/stores/transformCalendarEvents";

  const troiController = new TroiController();

  let selectedDate = new Date();
  let selectedWeek = getWeekDaysFor(selectedDate);

  let positions = [];
  let timesAndEventsOfSelectedWeek = [];
  let selectedDayEvents = [];
  let entriesForSelectedDate = {};

  let isLoading = true;

  let phaseTasks;
  let recurringTasks;

  async function getDefaultTasks() {
    let tasks = await nocodbApi.dbTableRow.list(
      "v1",
      "ds4g-data",
      "Tracky-Task"
    );
    phaseTasks = tasks.list.filter((keyword) => keyword.type === "PHASE");
    recurringTasks = tasks.list.filter(
      (keyword) => keyword.type === "RECURRING"
    );
  }

  onMount(async () => {
    // make sure $troiApi from store is not used before it is initialized
    if ($troiApi === undefined) return;

    await troiController.init($troiApi, showLoadingSpinner, hideLoadingSpinner);
    positions = troiController.getProjects();
    await updateUI();
    await getDefaultTasks();
    hideLoadingSpinner();
  });

  async function updateUI() {
    entriesForSelectedDate = await troiController.getEntriesFor(selectedDate);
    timesAndEventsOfSelectedWeek =
      troiController.getTimesAndEventsFor(selectedWeek);
    selectedDayEvents = troiController.getEventsFor(selectedDate);
  }

  async function onSelectedDateChangedTo(date) {
    selectedDayEvents = [];
    selectedDate = date;
    selectedWeek = getWeekDaysFor(selectedDate);
    updateUI();
  }

  async function onAddEntryClicked(position, hours, description) {
    showLoadingSpinner();
    await troiController.addEntry(
      selectedDate,
      position,
      hours,
      description,
      updateUI
    );
    hideLoadingSpinner();
  }

  async function onUpdateEntryClicked(position, entry) {
    showLoadingSpinner();
    await troiController.updateEntry(position, entry, updateUI);
    hideLoadingSpinner();
  }

  async function onDeleteEntryClicked(entry, positionId) {
    showLoadingSpinner();
    await troiController.deleteEntry(entry, positionId, updateUI);
    hideLoadingSpinner();
  }

  function showLoadingSpinner() {
    isLoading = true;
  }

  function hideLoadingSpinner() {
    isLoading = false;
  }
</script>

{#if isLoading}
  <LoadingOverlay message={"Please wait..."} />
{/if}
<section class="p-4">
  <a
    class="angie-link"
    href="https://digitalservicebund.atlassian.net/wiki/spaces/DIGITALSER/pages/359301512/Time+Tracking"
    target="_blank">Read about how to track your time in confluence</a
  >
</section>
<section class="z-10 w-full bg-white md:sticky md:top-0">
  <WeekView
    {timesAndEventsOfSelectedWeek}
    selectedDateChanged={onSelectedDateChangedTo}
  />
</section>

{#each selectedDayEvents as event}
  <InfoBanner {event} />
{/each}
<!-- TODO: set disabled correctly-->
{#if !selectedDayEvents.some((event) => event.type == CalendarEventType.Holiday)}
  <TroiTimeEntries
    {positions}
    {recurringTasks}
    {phaseTasks}
    entries={entriesForSelectedDate}
    deleteEntry={onDeleteEntryClicked}
    updateEntry={onUpdateEntryClicked}
    addEntry={onAddEntryClicked}
    disabled={selectedDayIsHoliday}
  />
{/if}
<section class="mt-8 text-xs text-gray-600">
  <p>
    Project not showing up? Make sure it's available in Troi and marked as a
    "favorite".
  </p>
</section>

<style>
  :root {
    --date-input-width: 6.5rem;
  }
</style>
