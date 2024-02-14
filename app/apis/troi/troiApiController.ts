import type { CalendarEvent } from "troi-library";
import TroiApiService from "troi-library";
import { addDaysToDate } from "~/utils/dateTimeUtils";
import type { CalculationPosition, TimeEntries, TimeEntry } from "./troi.types";
import { staleWhileRevalidate } from "../../utils/staleWhileRevalidate";
import type { Session } from "@remix-run/node";
import { commitSession } from "~/sessions.server";
import moment from "moment";

const BASE_URL = "https://digitalservice.troi.software/api/v2/rest";
const CLIENT_NAME = "DigitalService GmbH des Bundes";
const START_DATE = moment(addDaysToDate(new Date(), -366)).format("YYYYMMDD");
const END_DATE = moment(addDaysToDate(new Date(), 366)).format("YYYYMMDD");

async function getTroiApi(
  username?: string,
  password?: string,
  clientId?: number,
  employeeId?: number,
): Promise<TroiApiService> {
  if (!username) {
    throw new Error("Missing username");
  }

  if (!password) {
    throw new Error("Missing troi access token");
  }

  const troiApi = new TroiApiService({
    baseUrl: BASE_URL,
    clientName: CLIENT_NAME,
    username,
    password,
  });

  if (clientId) {
    troiApi.clientId = clientId;
  }

  if (employeeId) {
    troiApi.employeeId = employeeId;
  }

  return troiApi;
}

export async function getClientId(session: Session): Promise<number> {
  const cacheClientId = session.get("troiClientId");
  if (cacheClientId !== undefined) {
    return cacheClientId;
  }

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );
  console.log("[TroiAPI]", "getClientId()");
  const clientId = await troiApi.getClientId();

  session.set("troiClientId", clientId);
  await commitSession(session);

  return clientId;
}

export async function getEmployeeId(session: Session): Promise<number> {
  const cacheEmployeeId = session.get("troiEmployeeId");
  if (cacheEmployeeId !== undefined) {
    return cacheEmployeeId;
  }

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
    await getClientId(session),
  );
  console.log("[TroiAPI]", "getEmployeeId()");
  const employeeId = await troiApi.getEmployeeId();

  session.set("troiEmployeeId", employeeId);
  await commitSession(session);

  return employeeId;
}

async function fetchCalculationPositionsAndSaveToSession(session: Session) {
  const clientId = await getClientId(session);

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );

  console.log("[TroiAPI]", "GET /calculationPositions");

  const calculationPositions: CalculationPosition[] = (
    (await troiApi.makeRequest({
      url: "/calculationPositions",
      params: {
        clientId: clientId.toString(),
        favoritesOnly: true.toString(),
      },
    })) as {
      Id: number;
      DisplayPath: string;
      Subproject: {
        id: number;
      };
    }[]
  ).map((obj) => ({
    name: obj.DisplayPath,
    id: obj.Id,
    subprojectId: obj.Subproject.id,
  }));

  return calculationPositions;
}

export async function getCalculationPositions(
  session: Session,
  shouldRevalidate = true,
): Promise<CalculationPosition[]> {
  return staleWhileRevalidate(
    session,
    fetchCalculationPositionsAndSaveToSession,
    "troiCalculationPositions",
    shouldRevalidate,
  );
}

async function fetchCalendarEventsAndSaveToSession(session: Session) {
  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );

  console.log("[TroiAPI]", "getCalendarEvents()");

  const calendarEvents = await troiApi.getCalendarEvents(START_DATE, END_DATE);

  return calendarEvents;
}

export async function getCalendarEvents(
  session: Session,
): Promise<CalendarEvent[]> {
  return staleWhileRevalidate(
    session,
    fetchCalendarEventsAndSaveToSession,
    "troiCalendarEvents",
  );
}

async function fetchTimeEntriesAndSaveToSession(session: Session) {
  const clientId = await getClientId(session);
  const employeeId = await getEmployeeId(session);

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );

  const calculationPositions = await getCalculationPositions(session);
  const entries: TimeEntry[] = (
    await Promise.all(
      calculationPositions.map((calcPos) => {
        console.log(
          "[TroiAPI]",
          `GET /billings/hours for CalculationPosition ${calcPos.id}`,
        );

        return troiApi.makeRequest({
          url: "/billings/hours",
          params: {
            clientId: clientId.toString(),
            employeeId: employeeId.toString(),
            calculationPositionId: calcPos.id.toString(),
            startDate: START_DATE,
            endDate: END_DATE,
          },
        }) as Promise<{
          id: number;
          Date: string;
          Quantity: string;
          Remark: string;
          CalculationPosition: {
            id: number;
          };
        }>;
      }),
    )
  )
    .flat()
    .map((entry) => {
      return {
        id: entry.id,
        date: entry.Date,
        hours: parseFloat(entry.Quantity),
        description: entry.Remark,
        calculationPosition: entry.CalculationPosition.id,
      };
    });

  const entriesById: TimeEntries = {};
  for (const entry of entries) {
    entriesById[entry.id] = entry;
  }

  return entriesById;
}

export async function getTimeEntries(session: Session): Promise<TimeEntries> {
  return staleWhileRevalidate(
    session,
    fetchTimeEntriesAndSaveToSession,
    "troiTimeEntries",
  );
}

export async function addTimeEntry(
  session: Session,
  calculationPostionId: number,
  date: string,
  hours: number,
  description: string,
) {
  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
    await getClientId(session),
    await getEmployeeId(session),
  );

  console.log("[TroiAPI]", "postTimeEntry()");

  const result = (await troiApi.postTimeEntry(
    calculationPostionId,
    date,
    hours,
    description,
  )) as {
    id: number;
    Name: string;
    Quantity: string;
  };

  const existingEntries = session.get("troiTimeEntries");
  if (existingEntries !== undefined) {
    existingEntries[result.id] = {
      id: result.id,
      date: date,
      hours: parseFloat(result.Quantity),
      description: result.Name,
      calculationPosition: calculationPostionId,
    };
    session.set("troiTimeEntries", existingEntries);
    await commitSession(session);
  }

  return result;
}

export async function deleteTimeEntry(session: Session, id: number) {
  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );

  console.log("[TroiAPI]", "deleteTimeEntry()");

  await troiApi.deleteTimeEntry(id);

  const existingEntries = session.get("troiTimeEntries");

  if (existingEntries) {
    delete existingEntries[id];
    session.set("troiTimeEntries", existingEntries);
    await commitSession(session);
  }
}

export async function updateTimeEntry(
  session: Session,
  id: number,
  hours: number,
  description: string,
) {
  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );

  const payload = {
    Client: {
      Path: `/clients/${await getClientId(session)}`,
    },
    Employee: {
      Path: `/employees/${await getEmployeeId(session)}`,
    },
    Quantity: hours,
    Remark: description,
  };

  console.log("[TroiAPI]", `PUT /billings/hours/${id}`);

  const res = (await troiApi.makeRequest({
    url: `/billings/hours/${id}`,
    headers: { "Content-Type": "application/json" },
    method: "PUT",
    body: JSON.stringify(payload),
  })) as {
    Name: string;
    Quantity: string;
  };

  const existingEntries = session.get("troiTimeEntries");

  if (existingEntries) {
    existingEntries[id].hours = parseFloat(res.Quantity);
    existingEntries[id].description = res.Name;
    session.set("troiTimeEntries", existingEntries);
    await commitSession(session);
  }
}
