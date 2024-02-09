import type { CalendarEvent } from "troi-library";

import type { Cookie, Session } from "@remix-run/node";
import {
  createCookie,
  createFileSessionStorage,
  createMemorySessionStorage,
  redirect,
} from "@remix-run/node";
import type { TimeEntries } from "./troi/TimeEntry";
import type { CalculationPosition } from "./troi/CalculationPosition";
import type { PersonioEmployee } from "./personio/PersonioEmployee";
import type { PersonioAttendance } from "./personio/PersonioAttendance";

export type SessionData = {
  username: string;
  troiPassword: string;
  troiClientId: number;
  troiEmployeeId: number;
  troiCalculationPositions: CalculationPosition[];
  troiTimeEntries: TimeEntries;
  troiCalendarEvents: CalendarEvent[];
  personioEmployee: PersonioEmployee;
  personioAttendances: PersonioAttendance[];
};

function createSessionStorage(cookie: Cookie) {
  if (process.env.MOCK_EXTERNAL_APIS && process.env.NODE_ENV !== "production") {
    return createMemorySessionStorage<SessionData>({
      cookie,
    });
  }

  return createFileSessionStorage<SessionData>({
    dir: "./sessions",
    cookie,
  });
}

const sessionCookieSecret = process.env.SESSION_COOKIE_SECRET;
if (sessionCookieSecret === undefined) {
  throw new Error(
    "Missing secret for session cookie (enviroment variable SESSION_COOKIE_SECRET)",
  );
}

const sessionCookie = createCookie("__session", {
  maxAge: 30 * 24 * 60 * 60,
  secrets: [sessionCookieSecret],
  sameSite: "lax",
  secure: true,
  httpOnly: true,
});

const { getSession, commitSession, destroySession } =
  createSessionStorage(sessionCookie);

export async function isSessionValid(session: Session): Promise<boolean> {
  return session.has("username") && session.has("troiPassword");
}

export async function getSessionAndThrowIfInvalid(
  request: Request,
): Promise<Session> {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);
  if (!(await isSessionValid(session))) {
    throw redirect("/login");
  }
  return session;
}

export { getSession, commitSession, destroySession };
