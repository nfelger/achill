import { useFetcher } from "@remix-run/react";
import moment from "moment";
import { useEffect, useState } from "react";
import { PersonioAttendance } from "~/personio/PersonioAttendance";
import { hoursToTime, minutesToTime } from "~/utils/dateUtils";
import { LoadingOverlay } from "./LoadingOverlay";

interface Props {
  selectedDate: Date;
  workingHours: number;
  attendance?: PersonioAttendance;
}

function calculateWorkTime(attendance: PersonioAttendance) {
  const [startTimeHours, startTimeMinutes] = attendance.start_time
    .split(":")
    .map((x) => parseInt(x, 10));
  const [endTimeHours, endTimeMinutes] = attendance.end_time
    .split(":")
    .map((x) => parseInt(x, 10));

  return moment()
    .set("hours", endTimeHours)
    .set("minutes", endTimeMinutes)
    .subtract(startTimeHours, "hours")
    .subtract(startTimeMinutes, "minutes")
    .subtract(attendance?.breakTime ?? 0, "minutes")
    .format("HH:mm");
}

const DEFAULT_START_TIME = "09:00";
const DEFAULT_BREAK_TIME = "01:00";

export function WorkingTimeForm({
  selectedDate,
  workingHours,
  attendance,
}: Props) {
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [breakTime, setBreakTime] = useState(DEFAULT_BREAK_TIME);
  // todo (Malte Laukötter, 2023-12-22): change workTime to time outside of projects
  const [workTime, setWorkTime] = useState(hoursToTime(workingHours));

  useEffect(() => {
    setStartTime(attendance?.start_time ?? DEFAULT_START_TIME);
    setBreakTime(
      attendance ? minutesToTime(attendance.breakTime) : DEFAULT_BREAK_TIME,
    );
    setWorkTime(
      attendance ? calculateWorkTime(attendance) : hoursToTime(workingHours),
    );
  }, [selectedDate, workingHours, attendance]);

  const fetcher = useFetcher();

  return (
    <div>
      {fetcher.state !== "idle" && <LoadingOverlay message="Please wait..." />}
      <fetcher.Form
        method={attendance ? "PATCH" : "POST"}
        action={attendance ? `/work_time/${attendance?.id}` : "/work_time"}
      >
        <input
          name="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          name="breakTime"
          type="time"
          value={breakTime}
          onChange={(e) => setBreakTime(e.target.value)}
        />
        <input
          name="workTime"
          type="time"
          value={workTime}
          onChange={(e) => setWorkTime(e.target.value)}
        />
        <input
          name="comment"
          type="text"
          value={"Personio API Test"}
          readOnly
          hidden
        />
        <input
          name="date"
          value={moment(selectedDate).format("YYYY-MM-DD")}
          readOnly
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
      {attendance && (
        <fetcher.Form method="delete" action={`/work_time/${attendance.id}`}>
          <button
            type="submit"
            data-test="add-button"
            className="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
          >
            Delete
          </button>
        </fetcher.Form>
      )}
    </div>
  );
}
