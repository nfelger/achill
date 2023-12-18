import type { CalendarEvent } from "troi-library";

// how to invalidate:
// 1. shortish ttl for session-cookie
// 2. revalidate after request was send (stale-while-revalidate)

// split login & troi data sessions in two and add a ttl to the session data cookie? or save it as a session cookie?

import { createCookie, createFileSessionStorage } from "@remix-run/node";
import type { TimeEntries } from "./troi/TimeEntry";
import type { CalculationPosition } from "./troi/CalculationPosition";

export type SessionData = {
  username: string;
  troiPassword: string;
  troiClientId: number;
  troiEmployeeId: number;
  troiCalculationPositions: CalculationPosition[];
  troiTimeEntries: TimeEntries;
  troiCalendarEvents: CalendarEvent[];
};

const sessionCookie = createCookie("__session", {
  maxAge: 30 * 24 * 60 * 60,
  secrets: ["todo_create_a_secret_and_load_from_env"],
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
