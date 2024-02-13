import { useFetcher } from "@remix-run/react";
import moment from "moment";
import { useState } from "react";
import type { PersonioAttendance } from "~/personio/Personio.types";
import { minutesToTime } from "~/utils/dateTimeUtils";
import { TrackyButton } from "./TrackyButton";
import { buttonBlue, buttonRed } from "~/utils/colors";
import { TimeInput } from "./TimeInput";

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

  const personioFetcher = useFetcher({ key: "Personio" });

  return (
    <div className="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
      <personioFetcher.Form
        method="POST"
        action={`/work_time/${attendance?.id ?? ""}`}
      >
        <div className="flex flex-col gap-3">
          <TimeInput
            name="startTime"
            value={startTime}
            onChangeTime={setStartTime}
            label="Start time"
          />
          <TimeInput
            name="breakTime"
            value={breakTime}
            onChangeTime={setBreakTime}
            label="Break"
          />
          <TimeInput
            name="endTime"
            value={endTime}
            onChangeTime={setEndTime}
            label="End time"
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
          <div>
            {attendance ? (
              <div className="flex gap-2">
                <TrackyButton
                  name="_intent"
                  value="DELETE"
                  color={buttonRed}
                  testId="delete-button"
                >
                  Delete
                </TrackyButton>
                <TrackyButton
                  name="_intent"
                  value="PATCH"
                  testId="update-button"
                >
                  Update
                </TrackyButton>
              </div>
            ) : (
              <TrackyButton name="_intent" value="POST" testId="add-button">
                Save
              </TrackyButton>
            )}
          </div>
        </div>
      </personioFetcher.Form>
    </div>
  );
}
