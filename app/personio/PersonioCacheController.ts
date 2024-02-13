import { staleWhileRevalidate } from "~/utils/staleWhileRevalidate";
import {
  getEmployeeDataByMailAddress,
  getEmployeeData as getEmployeeDataById,
  getAttendances as _getAttendances,
  postAttendance as _postAttendance,
  deleteAttendance as _deleteAttendance,
  patchAttendance as _patchAttendance,
} from "./PersonioApiController";
import { redirect } from "@remix-run/node";
import type { Session } from "@remix-run/node";
import { addDaysToDate } from "~/utils/dateTimeUtils";
import type { PersonioAttendance } from "./Personio.types";
import moment from "moment";

function usernameToDigitalserviceMail(username: string) {
  return `${username}@digitalservice.bund.de`;
}

export async function getEmployeeData(session: Session) {
  const username = session.get("username");
  if (username === undefined) {
    throw redirect("/login");
  }

  const employeeId = session.get("personioEmployee")?.id;
  const mailAddress = usernameToDigitalserviceMail(username);
  const fetcher = employeeId
    ? async () => getEmployeeDataById(employeeId)
    : async () => getEmployeeDataByMailAddress(mailAddress);

  return staleWhileRevalidate(session, fetcher, "personioEmployee");
}

export async function getAttendances(session: Session) {
  const employeeId =
    session.get("personioEmployee")?.id ?? (await getEmployeeData(session)).id;

  const fetcher = async () => {
    const startDate = addDaysToDate(new Date(), -366);
    const endDate = addDaysToDate(new Date(), 366);
    const result = await _getAttendances(
      employeeId,
      startDate,
      endDate,
      200,
      0,
    );
    let data = result.data;

    if (result.metadata.total_pages > 1) {
      const result2 = await _getAttendances(
        employeeId,
        startDate,
        endDate,
        200,
        200,
      );

      if (result.metadata.total_pages > 2) {
        console.error(
          "There are more than 400 personio attendances, please adjust the pagination logic :)",
        );
      }

      data = [...data, ...result2.data];
    }

    return data.map(
      ({
        id,
        attributes: { date, start_time, end_time, break: breakTime, comment },
      }) => ({
        id,
        date,
        start_time,
        end_time,
        breakTime,
        comment,
      }),
    );
  };

  return staleWhileRevalidate(session, fetcher, "personioAttendances");
}

export async function postAttendance(
  session: Session,
  startTime: Date,
  endTime: Date,
  breakTime: number,
  comment: string,
) {
  const employeeId = (await getEmployeeData(session)).id;

  const response = await _postAttendance(
    employeeId,
    startTime,
    endTime,
    breakTime,
    comment,
  );

  const existingAttendances = session.get("personioAttendances");

  if (response.success && existingAttendances !== undefined) {
    existingAttendances.push({
      id: response.data.id[0],
      date: moment(startTime).format("YYYY-MM-DD"),
      start_time: moment(startTime).format("HH:mm"),
      end_time: moment(endTime).format("HH:mm"),
      breakTime,
      comment,
    });
    session.set("personioAttendances", existingAttendances);
  }

  return response;
}

export async function deleteAttendance(session: Session, attendanceId: number) {
  const response = await _deleteAttendance(attendanceId);
  const existingAttendances = session.get("personioAttendances");
  if (response.success && existingAttendances !== undefined) {
    session.set(
      "personioAttendances",
      existingAttendances.filter(
        ({ id }: { id: number }) => id.toString() !== attendanceId.toString(),
      ),
    );
  }

  return response;
}

export async function patchAttendance(
  session: Session,
  attendanceId: number,
  startTime: Date,
  endTime: Date,
  breakTime: number,
  comment: string,
) {
  const response = await _patchAttendance(
    attendanceId,
    startTime,
    endTime,
    breakTime,
    comment,
  );

  const existingAttendances = session.get("personioAttendances");

  if (response.success && existingAttendances !== undefined) {
    session.set(
      "personioAttendances",
      existingAttendances.map((attendance: PersonioAttendance) => {
        if (attendance.id === attendanceId) {
          return {
            id: attendanceId,
            date: moment(startTime).format("YYYY-MM-DD"),
            start_time: moment(startTime).format("HH:mm"),
            end_time: moment(endTime).format("HH:mm"),
            breakTime,
            comment,
          };
        } else {
          return attendance;
        }
      }),
    );
  }

  return response;
}
