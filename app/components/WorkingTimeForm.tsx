import { Form, useFetcher } from "@remix-run/react";
import moment from "moment";

interface Props {
  selectedDate: Date;
}

export function WorkingTimeForm({ selectedDate }: Props) {
  const fetcher = useFetcher();

  return (
    <div>
      <fetcher.Form method="post" action="/work_time">
        <input name="startTime" type="time" />
        <input name="breakTime" type="text" />
        <input name="workTime" type="text" />
        <input
          name="date"
          value={moment(selectedDate).format("YYYY-MM-DD")}
          hidden
        />
        <button
          type="submit"
          data-test="add-button"
          className="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
        >
          Save
        </button>
      </fetcher.Form>
    </div>
  );
}
