import type { CalendarEvent } from "troi-library";

import { createCookie, createFileSessionStorage } from "@remix-run/node";
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
  createFileSessionStorage<SessionData>({
    dir: "./sessions",
    cookie: sessionCookie,
  });

export async function isSessionValid(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  return session.has("username") && session.has("troiPassword");
}

export { getSession, commitSession, destroySession };
