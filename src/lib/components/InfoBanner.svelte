<script>
  import { CalendarEventDuration } from "$lib/stores/transformCalendarEvents";
  import {
    getItemForEventType,
    getDescriptionForEventType,
  } from "$lib/utils/calendarEventUtils.js";

  export let event;
  let symbol = getItemForEventType(event.type);
  let text = "";

  if (event.duration == CalendarEventDuration.HalfDay) {
    text = "½ Day: ";
  }

  text += getDescriptionForEventType(event.type);
</script>

<div
  data-testid={event.type}
  class="mt-4 flex w-full items-center justify-start rounded-lg bg-blue-600 p-4"
>
  <span class="material-symbols-outlined mr-2 text-white">
    {symbol}
  </span>
  <p class="text-sm text-white">
    {text}
  </p>
</div>
