import { useFetcher } from "@remix-run/react";
import moment from "moment";
import { useEffect, useState } from "react";
import type { PersonioAttendance } from "~/personio/PersonioAttendance";
import { minutesToTime } from "~/utils/dateUtils";
import { LoadingOverlay } from "./LoadingOverlay";

interface Props {
  selectedDate: Date;
  workTime: number;
  attendance?: PersonioAttendance;
}

const DEFAULT_START_TIME = "09:00";
const DEFAULT_BREAK_TIME = "01:00";
const DEFAULT_END_TIME = "18:00";

export function WorkingTimeForm({ selectedDate, workTime, attendance }: Props) {
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [breakTime, setBreakTime] = useState(DEFAULT_BREAK_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME);

  useEffect(() => {
    setStartTime(attendance?.start_time ?? DEFAULT_START_TIME);
    setBreakTime(
      attendance ? minutesToTime(attendance.breakTime) : DEFAULT_BREAK_TIME,
    );
  }, [selectedDate, attendance]);

  useEffect(() => {
    const momentStartTime = moment(startTime, "HH:mm");
    const momentBreakTime = moment(breakTime, "HH:mm");
    const momentWorkTime = moment(minutesToTime(workTime * 60), "HH:mm");

    const newEndTime = momentStartTime
      .add(momentBreakTime.hours(), "hours")
      .add(momentBreakTime.minutes(), "minutes")
      .add(momentWorkTime.hours(), "hours")
      .add(momentWorkTime.minutes(), "minutes")
      .format("HH:mm");

    setEndTime(newEndTime);
  }, [startTime, breakTime, workTime]);

  const fetcher = useFetcher();

  function addMinutesToTime(minutes: number, time: string) {
    return moment(time, "HH:mm").add(minutes, "minutes").format("HH:mm");
  }

  return (
    <div>
      {fetcher.state !== "idle" && <LoadingOverlay message="Please wait..." />}
      <fetcher.Form
        method={attendance ? "PATCH" : "POST"}
        action={attendance ? `/work_time/${attendance?.id}` : "/work_time"}
      >
        <div className="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
          <div className="flex flex-col gap-3">
            <div className="flex justify-start items-center">
              <label className="inline-block w-24" htmlFor="startTime">
                Start time
              </label>
              <span
                className="material-symbols-outlined cursor-pointer select-none"
                onClick={() => {
                  setStartTime(addMinutesToTime(-30, startTime));
                }}
              >
                Remove
              </span>
              <input
                className="mx-4"
                id="startTime"
                name="startTime"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                }}
              />
              <span
                className="material-symbols-outlined cursor-pointer select-none"
                onClick={() => {
                  setStartTime(addMinutesToTime(30, startTime));
                }}
              >
                Add
              </span>
            </div>
            <div className="flex justify-start items-center">
              <label className="inline-block w-24" htmlFor="breakTime">
                Break
              </label>
              <span
                className="material-symbols-outlined cursor-pointer select-none"
                onClick={() => {
                  setBreakTime(addMinutesToTime(-15, breakTime));
                }}
              >
                Remove
              </span>
              <input
                className="mx-4"
                id="breakTime"
                name="breakTime"
                type="time"
                value={breakTime}
                onChange={(e) => {
                  setBreakTime(e.target.value);
                }}
              />
              <span
                className="material-symbols-outlined cursor-pointer select-none"
                onClick={() => {
                  setBreakTime(addMinutesToTime(15, breakTime));
                }}
              >
                Add
              </span>
            </div>
            <div className="flex justify-start items-center">
              <label className="inline-block w-24" htmlFor="endTime">
                End time
              </label>
              <span
                className="material-symbols-outlined cursor-pointer select-none"
                onClick={() => {
                  setEndTime(addMinutesToTime(-30, endTime));
                }}
              >
                Remove
              </span>
              <input
                className="mx-4"
                id="endTime"
                name="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <span
                className="material-symbols-outlined cursor-pointer select-none"
                onClick={() => {
                  setEndTime(addMinutesToTime(30, endTime));
                }}
              >
                Add
              </span>
            </div>
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
            <div>
              <button
                type="submit"
                data-test="add-button"
                className="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
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
