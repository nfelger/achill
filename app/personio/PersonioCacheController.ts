import { staleWhileRevalidate } from "~/utils/staleWhileRevalidate";
import {
  getEmployeeDataByMailAddress,
  getEmployeeData as getEmployeeDataById,
  getAttendances as _getAttendances,
} from "./PersonioApiController";
import { getSession } from "~/sessions.server";
import { redirect } from "@remix-run/node";
import { addDaysToDate } from "~/utils/dateUtils";

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

export async function getAttendances(request: Request) {
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

        return [...result.data, ...result2.data];
      }

      return result.data;
    },
    "personioAttendances",
  );
}
