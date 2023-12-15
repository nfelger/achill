import type { CalendarEvent } from "troi-library";
import TroiApiService from "troi-library";
import type { SessionData } from "~/sessions";
import { commitSession, getSession } from "~/sessions";
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

  const calculationPositions: CalculationPosition[] = (
    (await troiApi.makeRequest({
      url: "/calculationPositions",
      params: {
        clientId: clientId.toString(),
        favoritesOnly: true.toString(),
      },
    })) as any[]
  ).map((obj: any) => ({
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
): Promise<CalculationPosition[]> {
  return staleWhileRevalidate(
    request,
    fetchCalculationPositionsAndSaveToSession,
    "troiCalculationPositions",
  );
}

async function fetchCalenderEventsAndSaveToSession(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const troiApi = await getTroiApi(
    session.get("username"),
    session.get("troiPassword"),
  );
  const calendarEvents = await troiApi.getCalendarEvents(
    formatDateToYYYYMMDD(addDaysToDate(new Date(), -366)),
    formatDateToYYYYMMDD(addDaysToDate(new Date(), 366)),
  );

  session.set("troiCalendarEvents", calendarEvents);
  await commitSession(session);

  return calendarEvents;
}

export async function getCalenderEvents(
  request: Request,
): Promise<CalendarEvent[]> {
  return staleWhileRevalidate(
    request,
    fetchCalenderEventsAndSaveToSession,
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
      calculationPositions.map((calcPos) =>
        troiApi.makeRequest({
          url: "/billings/hours",
          params: {
            clientId: clientId.toString(),
            employeeId: employeeId.toString(),
            calculationPositionId: calcPos.id.toString(),
            startDate: formatDateToYYYYMMDD(addDaysToDate(new Date(), -366)),
            endDate: formatDateToYYYYMMDD(addDaysToDate(new Date(), 366)),
          },
        }),
      ),
    )
  )
    .flat()
    .map((e: any) => {
      return {
        id: e.id,
        date: e.Date,
        hours: e.Quantity,
        description: e.Remark,
        calculationPosition: e.CalculationPosition.id,
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
): Promise<SessionData[Key]> {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const cacheData: SessionData[Key] | undefined = session.get(sessionKey);
  if (cacheData !== undefined) {
    // fetch in background
    void fetcher(request);
    return cacheData;
  }

  return await fetcher(request);
}
