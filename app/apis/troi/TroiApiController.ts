import { json, type Session } from "@remix-run/node";
import md5 from "crypto-js/md5.js";
import moment from "moment";
import { END_DATE, START_DATE } from "~/utils/dateTimeUtils";
import { ProjectTimeSaveFormData } from "~/utils/projectTimeFormValidator";
import type { CalendarEvent, CalendarEventType } from "./Troi.types";

const BASE_URL = "https://digitalservice.troi.software/api/v2/rest";
const CLIENT_NAME = "DigitalService GmbH des Bundes";
const START_DATE_YYYYMMDD = moment(START_DATE).format("YYYYMMDD");
const END_DATE_YYYYMMDD = moment(END_DATE).format("YYYYMMDD");

async function fetchWithTroiAuth<T>(
  session: Session,
  url: URL | string,
  init?: RequestInit,
): Promise<T> {
  const username = session.get("username");
  const password = session.get("troiPassword");

  console.log("[TroiAPI]", url.toString());

  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Basic ${btoa(`${username}:${md5(password)}`)}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      console.error("Invalid credentials", response.status);
      throw new Error("Invalid credentials");
    }
    console.error("Request failed", response);
    throw new Error("Request failed");
  }

  return await response.json();
}

type TroiClient = {
  Id: number;
  Name: string;
};
type TroiEmployee = {
  Id: number;
};
export async function initializeTroiApi(session: Session) {
  const troiClient = (
    await fetchWithTroiAuth<TroiClient[]>(session, `${BASE_URL}/clients`)
  ).find((client) => {
    return client.Name === CLIENT_NAME;
  });
  if (!troiClient) {
    throw new Error("Client not found");
  }
  const troiClientId = troiClient.Id.toString();

  const url = new URL(`${BASE_URL}/employees`);
  url.searchParams.set("clientId", troiClientId);
  url.searchParams.set("employeeLoginName", session.get("username"));
  const troiEmployees = await fetchWithTroiAuth<TroiEmployee[]>(session, url);
  const troiEmployee = troiEmployees[0];
  if (!troiEmployee) {
    throw new Error("Employee not found");
  }
  const troiEmployeeId = troiEmployee.Id.toString();
  return { troiClientId, troiEmployeeId };
}

type TroiCalendarEvent = {
  id: string;
  Start: string;
  End: string;
  Subject: string;
  Type: string;
};
export async function getCalendarEvents(session: Session) {
  const url = new URL(`${BASE_URL}/calendarEvents`);
  url.searchParams.set("start", START_DATE_YYYYMMDD);
  url.searchParams.set("end", END_DATE_YYYYMMDD);

  return (await fetchWithTroiAuth<TroiCalendarEvent[]>(session, url))
    .map((event) => ({
      id: event.id,
      startDate: event.Start,
      endDate: event.End,
      subject: event.Subject,
      type: event.Type as CalendarEventType,
    }))
    .sort((a: CalendarEvent, b: CalendarEvent) =>
      a.startDate > b.startDate ? 1 : -1,
    );
}

type TroiCalculationPosition = {
  Id: number;
  DisplayPath: string;
  Subproject: {
    id: number;
  };
};
export async function getCalculationPositions(session: Session) {
  const url = new URL(`${BASE_URL}/calculationPositions`);
  url.searchParams.set("clientId", session.get("troiClientId")!);
  url.searchParams.set("favoritesOnly", "true");
  url.searchParams.set("timeRecording", "true");

  return (await fetchWithTroiAuth<TroiCalculationPosition[]>(session, url)).map(
    (pos) => ({
      name: pos.DisplayPath,
      id: pos.Id,
      subprojectId: pos.Subproject.id,
    }),
  );
}

type TroiProjectTime = {
  id: number;
  Date: string;
  Quantity: string;
  Remark: string;
  CalculationPosition: {
    id: number;
  };
};
export async function getProjectTimes(session: Session) {
  const url = new URL(`${BASE_URL}/billings/hours`);
  url.searchParams.set("clientId", session.get("troiClientId"));
  url.searchParams.set("employeeId", session.get("troiEmployeeId"));
  url.searchParams.set("startDate", START_DATE_YYYYMMDD);
  url.searchParams.set("endDate", END_DATE_YYYYMMDD);

  return (await fetchWithTroiAuth<TroiProjectTime[]>(session, url)).map(
    (projectTime) => ({
      id: projectTime.id,
      date: projectTime.Date,
      hours: parseFloat(projectTime.Quantity),
      description: projectTime.Remark,
      calculationPositionId: projectTime.CalculationPosition.id,
    }),
    {},
  );
}

export async function addProjectTime(
  session: Session,
  { calculationPositionId, date, hours, description }: ProjectTimeSaveFormData,
) {
  const data = await fetchWithTroiAuth<{ id: number }>(
    session,
    `${BASE_URL}/billings/hours`,
    {
      method: "POST",
      body: JSON.stringify({
        Client: { Path: `/clients/${session.get("troiClientId")}` },
        CalculationPosition: {
          Path: `/calculationPositions/${calculationPositionId}`,
        },
        Employee: { Path: `/employees/${session.get("troiEmployeeId")}` },
        Date: date,
        Quantity: hours,
        Remark: description,
      }),
    },
  );

  return json(
    {
      success: true,
      id: data.id,
      date,
      hours,
      description,
      calculationPositionId,
    },
    { status: 200 },
  );
}

export async function updateProjectTime(
  session: Session,
  id: number,
  { calculationPositionId, date, hours, description }: ProjectTimeSaveFormData,
) {
  await fetchWithTroiAuth(session, `${BASE_URL}/billings/hours/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      Client: { Path: `/clients/${session.get("troiClientId")}` },
      CalculationPosition: {
        Path: `/calculationPositions/${calculationPositionId}`,
      },
      Employee: { Path: `/employees/${session.get("troiEmployeeId")}` },
      Date: date,
      Quantity: hours,
      Remark: description,
    }),
  });

  return json(
    {
      id,
      date,
      hours,
      description,
      calculationPositionId,
    },
    { status: 200 },
  );
}

export async function deleteProjectTime(session: Session, id: number) {
  await fetchWithTroiAuth(session, `${BASE_URL}/billings/hours/${id}`, {
    method: "DELETE",
  });

  return json({ id, test: "test" }, { status: 200 });
}
