import { staleWhileRevalidate } from "~/utils/staleWhileRevalidate";
import {
  getEmployeeDataByMailAddress,
  getEmployeeData as getEmployeeDataById,
  getAttendances as _getAttendances,
  postAttendance as _postAttendance,
  deleteAttendance as _deleteAttendance,
  patchAttendance as _patchAttendance,
} from "./PersonioApiController";
import { commitSession, getSession } from "~/sessions.server";
import { redirect } from "@remix-run/node";
import { addDaysToDate } from "~/utils/dateUtils";
import type { PersonioAttendance } from "./PersonioAttendance";
import moment from "moment";

function usernameToDigitalserviceMail(username: string) {
  return `${username}@digitalservice.bund.de`;
}

export async function getEmployeeData(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const username = session.get("username");
  if (username === undefined) {
    throw redirect("/login");
  }

  const employeeId = session.get("personioEmployee")?.id;

  if (employeeId) {
    return staleWhileRevalidate(
      request,
      () => getEmployeeDataById(employeeId),
      "personioEmployee",
    );
  }

  return staleWhileRevalidate(
    request,
    () => getEmployeeDataByMailAddress(usernameToDigitalserviceMail(username)),
    "personioEmployee",
  );
}

export async function getAttendances(
  request: Request,
): Promise<PersonioAttendance[]> {
  const employeeId = (await getEmployeeData(request)).id;

  return staleWhileRevalidate(
    request,
    async () => {
      const result = await _getAttendances(
        employeeId,
        addDaysToDate(new Date(), -366),
        addDaysToDate(new Date(), 366),
        200,
        0,
      );

      let data = result.data;

      if (result.metadata.total_pages > 1) {
        const result2 = await _getAttendances(
          employeeId,
          addDaysToDate(new Date(), -366),
          addDaysToDate(new Date(), 366),
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
    },
    "personioAttendances",
  );
}

export async function postAttendance(
  request: Request,
  startTime: Date,
  endTime: Date,
  breakTime: number,
  comment: string,
) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const employeeId = (await getEmployeeData(request)).id;

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
    await commitSession(session);
  }

  return response;
}

export async function deleteAttendance(request: Request, attendanceId: number) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const response = await _deleteAttendance(attendanceId);
  const existingAttendances = session.get("personioAttendances");
  if (response.success && existingAttendances !== undefined) {
    session.set(
      "personioAttendances",
      existingAttendances.filter(
        ({ id }) => id.toString() !== attendanceId.toString(),
      ),
    );
    await commitSession(session);
  }

  return response;
}

export async function patchAttendance(
  request: Request,
  attendanceId: number,
  startTime: Date,
  endTime: Date,
  breakTime: number,
  comment: string,
) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

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
      existingAttendances.map((attendance) => {
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
    await commitSession(session);
  }

  return response;
}
