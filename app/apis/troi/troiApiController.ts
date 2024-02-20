import type { Session } from "@remix-run/node";
import moment from "moment";
import type { CalendarEvent } from "troi-library";
import TroiApiService from "troi-library";
import { commitSession } from "~/sessions.server";
import { END_DATE, START_DATE } from "~/utils/dateTimeUtils";
import { staleWhileRevalidate } from "../../utils/staleWhileRevalidate";
import type {
  CalculationPosition,
  TroiProjectTime,
  TroiProjectTimesById,
} from "./troi.types";

const BASE_URL = "https://digitalservice.troi.software/api/v2/rest";
const CLIENT_NAME = "DigitalService GmbH des Bundes";
const START_DATE_YYYYMMDD = moment(START_DATE).format("YYYYMMDD");
const END_DATE_YYYYMMDD = moment(END_DATE).format("YYYYMMDD");

async function getTroiApi(session: Session): Promise<TroiApiService> {
  const username = session.get("username");
  const password = session.get("troiPassword");
  const clientId = session.get("troiClientId");
  const employeeId = session.get("troiEmployeeId");

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
  if (cacheClientId) {
    return cacheClientId;
  }

  const troiApi = await getTroiApi(session);
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

  const troiApi = await getTroiApi(session);
  console.log("[TroiAPI]", "getEmployeeId()");
  const employeeId = await troiApi.getEmployeeId();

  session.set("troiEmployeeId", employeeId);
  await commitSession(session);

  return employeeId;
}

async function fetchCalculationPositionsAndSaveToSession(session: Session) {
  const troiApi = await getTroiApi(session);
  const clientId = await getClientId(session);

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
  const troiApi = await getTroiApi(session);

  console.log("[TroiAPI]", "getCalendarEvents()");

  const calendarEvents = await troiApi.getCalendarEvents(
    START_DATE_YYYYMMDD,
    END_DATE_YYYYMMDD,
  );

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

async function fetchProjectTimesAndSaveToSession(session: Session) {
  const troiApi = await getTroiApi(session);
  const clientId = await getClientId(session);
  const employeeId = await getEmployeeId(session);

  const calculationPositions = await getCalculationPositions(session);
  const projectTimes: TroiProjectTime[] = (
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
            startDate: START_DATE_YYYYMMDD,
            endDate: END_DATE_YYYYMMDD,
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
    .map((projectTime) => {
      return {
        id: projectTime.id,
        date: projectTime.Date,
        hours: parseFloat(projectTime.Quantity),
        description: projectTime.Remark,
        calculationPosition: projectTime.CalculationPosition.id,
      };
    });

  const projectTimesById: TroiProjectTimesById = {};
  for (const projectTime of projectTimes) {
    projectTimesById[projectTime.id] = projectTime;
  }

  return projectTimesById;
}

export async function getProjectTimes(
  session: Session,
): Promise<TroiProjectTimesById> {
  return staleWhileRevalidate(
    session,
    fetchProjectTimesAndSaveToSession,
    "troiProjectTimes",
  );
}

export async function addProjectTime(
  session: Session,
  calculationPostionId: number,
  date: string,
  hours: number,
  description: string,
) {
  const troiApi = await getTroiApi(session);

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

  const existingProjectTimes = session.get("troiProjectTimes");
  if (existingProjectTimes !== undefined) {
    existingProjectTimes[result.id] = {
      id: result.id,
      date: date,
      hours: parseFloat(result.Quantity),
      description: result.Name,
      calculationPosition: calculationPostionId,
    };
    session.set("troiProjectTimes", existingProjectTimes);
    await commitSession(session);
  }

  return result;
}

export async function deleteProjectTime(session: Session, id: number) {
  const troiApi = await getTroiApi(session);

  console.log("[TroiAPI]", "deleteTimeEntry()");

  await troiApi.deleteTimeEntry(id);

  const existingProjectTimes = session.get("troiProjectTimes");

  if (existingProjectTimes) {
    delete existingProjectTimes[id];
    session.set("troiProjectTimes", existingProjectTimes);
    await commitSession(session);
  }
}

export async function updateProjectTime(
  session: Session,
  id: number,
  hours: number,
  description: string,
) {
  const troiApi = await getTroiApi(session);

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

  const existingProjectTimes = session.get("troiProjectTimes");

  if (existingProjectTimes) {
    existingProjectTimes[id].hours = parseFloat(res.Quantity);
    existingProjectTimes[id].description = res.Name;
    session.set("troiProjectTimes", existingProjectTimes);
    await commitSession(session);
  }
}
