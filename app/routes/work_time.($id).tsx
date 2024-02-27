/* eslint-disable no-case-declarations */
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import moment from "moment";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import type { PersonioAttendance } from "~/apis/personio/Personio.types";
import {
  deleteAttendance,
  patchAttendance,
  postAttendance,
} from "~/apis/personio/PersonioApiController";
import { minutesToTime } from "~/utils/dateTimeUtils";
import { workTimeFormDataSchema } from "~/utils/workTimeFormValidator";
import { TimeInput } from "../components/common/TimeInput";
import { TrackyButton, buttonRed } from "../components/common/TrackyButton";

function parseWorkTimeFormData(formData: FormData) {
  try {
    return workTimeFormDataSchema.parse(Object.fromEntries(formData.entries()));
  } catch (error) {
    throw json(error, { status: 422 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = params.id;
  const { date, startTime, breakTime, endTime, _action } =
    parseWorkTimeFormData(formData);

  switch (_action) {
    case "POST":
      return await postAttendance(request, date, startTime, endTime, breakTime);
    case "PATCH":
      if (!id) {
        throw new Response("Attendance ID is required.", { status: 400 });
      }
      return await patchAttendance(id, date, startTime, endTime, breakTime);
    case "DELETE":
      if (!id) {
        throw new Response("Attendance ID is required.", { status: 400 });
      }
      return await deleteAttendance(id);
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
}

const DEFAULT_START_TIME = "09:00";
const DEFAULT_BREAK_TIME = "01:00";

function getEndTime(workTime: number) {
  // calculate end time based on daily work time from personio
  const momentStartTime = moment(DEFAULT_START_TIME, "HH:mm");
  const momentBreakTime = moment(DEFAULT_BREAK_TIME, "HH:mm");
  const momentWorkTime = moment(minutesToTime(workTime * 60), "HH:mm");

  return momentStartTime
    .add(momentBreakTime.hours(), "hours")
    .add(momentBreakTime.minutes(), "minutes")
    .add(momentWorkTime.hours(), "hours")
    .add(momentWorkTime.minutes(), "minutes")
    .format("HH:mm");
}

interface Props {
  selectedDate: Date;
  workTime: number;
  attendances: PersonioAttendance[];
  setAttendances: Dispatch<SetStateAction<PersonioAttendance[]>>;
}

export function WorkTimeForm({
  selectedDate,
  workTime,
  attendances,
  setAttendances,
}: Props) {
  const fetcher = useFetcher<typeof action>({ key: "Personio" });

  const attendanceOfSelectedDate = attendances.find(
    (attendance) =>
      attendance.date === moment(selectedDate).format("YYYY-MM-DD"),
  );

  const [startTime, setStartTime] = useState(
    attendanceOfSelectedDate
      ? attendanceOfSelectedDate.startTime
      : DEFAULT_START_TIME,
  );
  const [breakTime, setBreakTime] = useState(
    attendanceOfSelectedDate
      ? minutesToTime(attendanceOfSelectedDate.breakTime)
      : DEFAULT_BREAK_TIME,
  );
  const [endTime, setEndTime] = useState(
    attendanceOfSelectedDate
      ? attendanceOfSelectedDate.endTime
      : getEndTime(workTime),
  );
  const [isEdit, setIsEdit] = useState(!attendanceOfSelectedDate);

  function setIsEditPreventSubmit(event: any, value: boolean) {
    event.preventDefault();
    setIsEdit(value);
  }

  useEffect(() => {
    if (
      fetcher.state === "loading" &&
      fetcher.data?.success &&
      fetcher.formData
    ) {
      const submittedAttendance = fetcher.data;

      switch (fetcher.formData.get("_action")) {
        case "POST":
          setIsEdit(false);
          setAttendances([...attendances, submittedAttendance]);
          break;
        case "PATCH":
          setIsEdit(false);
          setAttendances(
            attendances.map((attendance) =>
              attendance.id === submittedAttendance.id
                ? submittedAttendance
                : attendance,
            ),
          );
          break;
        case "DELETE":
          setAttendances(
            attendances.filter(
              (attendance) => attendance.id !== submittedAttendance.id,
            ),
          );
          break;
        default:
          break;
      }
    }
  }, [fetcher.state]);

  return (
    <fetcher.Form
      method="POST"
      action={`/work_time/${attendanceOfSelectedDate?.id ?? ""}`}
      className="flex flex-col gap-3 block rounded-lg bg-gray-100 p-4 shadow-lg"
    >
      <TimeInput
        name="startTime"
        time={startTime}
        onChange={setStartTime}
        label="Start time"
        readOnly={!isEdit}
      />
      <TimeInput
        name="breakTime"
        time={breakTime}
        onChange={setBreakTime}
        label="Break"
        readOnly={!isEdit}
      />
      <TimeInput
        name="endTime"
        time={endTime}
        onChange={setEndTime}
        label="End time"
        readOnly={!isEdit}
      />
      <input
        name="date"
        value={moment(selectedDate).format("YYYY-MM-DD")}
        readOnly
        hidden
      />
      <div className="flex gap-2">
        {attendanceOfSelectedDate ? (
          isEdit ? (
            <>
              <TrackyButton
                type="reset"
                color={buttonRed}
                onClick={(e) => setIsEditPreventSubmit(e, false)}
                testId="cancel-button"
              >
                Cancel
              </TrackyButton>
              <TrackyButton name="_action" value="PATCH">
                Update
              </TrackyButton>
            </>
          ) : (
            <>
              <TrackyButton name="_action" value="DELETE" color={buttonRed}>
                Delete
              </TrackyButton>
              <TrackyButton
                type="button"
                onClick={(e) => setIsEditPreventSubmit(e, true)}
              >
                Edit
              </TrackyButton>
            </>
          )
        ) : (
          <TrackyButton name="_action" value="POST">
            Save
          </TrackyButton>
        )}
      </div>
    </fetcher.Form>
  );
}