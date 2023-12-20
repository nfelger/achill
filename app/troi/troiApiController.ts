import type { CalendarEvent } from "troi-library";
import TroiApiService, { AuthenticationFailed } from "troi-library";
import type { SessionData } from "~/sessions.server";
import { commitSession, destroySession, getSession } from "~/sessions.server";
import { addDaysToDate, formatDateToYYYYMMDD } from "~/utils/dateUtils";
import type { TimeEntries, TimeEntry } from "./TimeEntry";
import type { CalculationPosition } from "./CalculationPosition";

const BASE_URL = "https://digitalservice.troi.software/api/v2/rest";
const CLIENT_NAME = "DigitalService GmbH des Bundes";

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

export async function getClientId(request: Request): Promise<number> {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

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

export async function getEmployeeId(request: Request): Promise<number> {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const cacheEmployeeId = session.get("troiEmployeeId");
  if (cacheEmployeeId !== undefined) {
    return cacheEmployeeId;
  }

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
    await getClientId(request),
  );
  console.log("[TroiAPI]", "getEmployeeId()");
  const employeeId = await troiApi.getEmployeeId();

  session.set("troiEmployeeId", employeeId);
  await commitSession(session);

  return employeeId;
}

async function fetchCalculationPositionsAndSaveToSession(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const clientId = await getClientId(request);

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

  session.set("troiCalculationPositions", calculationPositions);
  await commitSession(session);

  return calculationPositions;
}

export async function getCalculationPositions(
  request: Request,
  shouldRevalidate = true,
): Promise<CalculationPosition[]> {
  return staleWhileRevalidate(
    request,
    fetchCalculationPositionsAndSaveToSession,
    "troiCalculationPositions",
    shouldRevalidate,
  );
}

async function fetchCalendarEventsAndSaveToSession(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );

  console.log("[TroiAPI]", "getCalendarEvents()");

  const calendarEvents = await troiApi.getCalendarEvents(
    formatDateToYYYYMMDD(addDaysToDate(new Date(), -366)),
    formatDateToYYYYMMDD(addDaysToDate(new Date(), 366)),
  );
  session.set("troiCalendarEvents", calendarEvents);
  await commitSession(session);

  return calendarEvents;
}

export async function getCalendarEvents(
  request: Request,
): Promise<CalendarEvent[]> {
  return staleWhileRevalidate(
    request,
    fetchCalendarEventsAndSaveToSession,
    "troiCalendarEvents",
  );
}

async function fetchTimeEntriesAndSaveToSession(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const clientId = await getClientId(request);
  const employeeId = await getEmployeeId(request);

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );

  const calculationPositions = await getCalculationPositions(request);
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
            startDate: formatDateToYYYYMMDD(addDaysToDate(new Date(), -366)),
            endDate: formatDateToYYYYMMDD(addDaysToDate(new Date(), 366)),
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

  session.set("troiTimeEntries", entriesById);
  await commitSession(session);

  return entriesById;
}

export async function getTimeEntries(request: Request): Promise<TimeEntries> {
  return staleWhileRevalidate(
    request,
    fetchTimeEntriesAndSaveToSession,
    "troiTimeEntries",
  );
}

export async function addTimeEntry(
  request: Request,
  calculationPostionId: number,
  date: string,
  hours: number,
  description: string,
) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
    await getClientId(request),
    await getEmployeeId(request),
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

export async function deleteTimeEntry(request: Request, id: number) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

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
  request: Request,
  id: number,
  hours: number,
  description: string,
) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );

  const payload = {
    Client: {
      Path: `/clients/${await getClientId(request)}`,
    },
    Employee: {
      Path: `/employees/${await getEmployeeId(request)}`,
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

/**
 * Return data from the session cache and revalidate cached data in the background.
 *
 * see also:  https://web.dev/articles/stale-while-revalidate
 *
 * @param request
 * @param fetcher - Fetch the data and commit it to the session cache
 * @param sessionKey
 * @returns
 */
async function staleWhileRevalidate<Key extends keyof SessionData>(
  request: Request,
  fetcher: (request: Request) => Promise<SessionData[Key]>,
  sessionKey: Key,
  shouldRevalidate = true,
): Promise<SessionData[Key]> {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const cacheData: SessionData[Key] | undefined = session.get(sessionKey);
  if (cacheData !== undefined) {
    console.debug(`Cache hit:`, sessionKey);
    if (shouldRevalidate) {
      // fetch in background
      void fetcher(request).catch((e) => {
        if (e instanceof AuthenticationFailed) {
          destroySession(session);
        } else {
          throw e;
        }
      });
    }
    return cacheData;
  }
  console.debug(`Cache miss:`, sessionKey);

  return await fetcher(request);
}
