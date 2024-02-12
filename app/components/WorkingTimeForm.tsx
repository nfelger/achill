import { useFetcher } from "@remix-run/react";
import moment from "moment";
import { useState } from "react";
import type { PersonioAttendance } from "~/personio/PersonioAttendance";
import { minutesToTime } from "~/utils/dateUtils";

interface Props {
  selectedDate: Date;
  workTime: number;
  attendance?: PersonioAttendance;
}

const DEFAULT_START_TIME = "09:00";
const DEFAULT_BREAK_TIME = "01:00";

export function WorkingTimeForm({ selectedDate, workTime, attendance }: Props) {
  // calculate end time based on daily work time from personio
  const momentStartTime = moment(DEFAULT_START_TIME, "HH:mm");
  const momentBreakTime = moment(DEFAULT_BREAK_TIME, "HH:mm");
  const momentWorkTime = moment(minutesToTime(workTime * 60), "HH:mm");

  const newEndTime = momentStartTime
    .add(momentBreakTime.hours(), "hours")
    .add(momentBreakTime.minutes(), "minutes")
    .add(momentWorkTime.hours(), "hours")
    .add(momentWorkTime.minutes(), "minutes")
    .format("HH:mm");

  const [startTime, setStartTime] = useState(
    attendance ? attendance.start_time : DEFAULT_START_TIME,
  );
  const [breakTime, setBreakTime] = useState(
    attendance ? minutesToTime(attendance.breakTime) : DEFAULT_BREAK_TIME,
  );
  const [endTime, setEndTime] = useState(
    attendance ? attendance.end_time : newEndTime,
  );
  const [method, setMethod] = useState<"POST" | "PATCH" | "DELETE">("POST");
  const [action, setAction] = useState("");

  const personioFetcher = useFetcher({ key: "Personio" });

  function addMinutesToTime(minutes: number, time: string) {
    return moment(time, "HH:mm").add(minutes, "minutes").format("HH:mm");
  }

  return (
    <div className="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
      <personioFetcher.Form method={method} action={action}>
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
            {!attendance && (
              <button
                type="submit"
                data-test="add-button"
                className="ease rounded bg-blue-600 text-s px-6 py-2.5 font-medium text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-600 hover:shadow-lg focus:bg-blue-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-600 active:shadow-lg"
                onClick={() => {
                  setAction(`/work_time`);
                  setMethod("POST");
                }}
              >
                Save
              </button>
            )}
            {attendance && (
              <div className="flex gap-2">
                <button
                  type="submit"
                  data-test="delete-button"
                  className="ease rounded bg-red-600 text-s px-6 py-2.5 font-medium text-white shadow-md transition duration-150 ease-in-out hover:bg-red-600 hover:shadow-lg focus:bg-red-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-600 active:shadow-lg"
                  onClick={() => {
                    setAction(`/work_time/${attendance?.id}`);
                    setMethod("DELETE");
                  }}
                >
                  Delete
                </button>
                <button
                  type="submit"
                  data-test="update-button"
                  className="ease rounded bg-blue-600 text-s px-6 py-2.5 font-medium text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-600 hover:shadow-lg focus:bg-blue-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-600 active:shadow-lg"
                  onClick={() => {
                    setAction(`/work_time/${attendance?.id}`);
                    setMethod("PATCH");
                  }}
                >
                  Update
                </button>
              </div>
            )}
          </div>
        </div>
      </personioFetcher.Form>
    </div>
  );
}
