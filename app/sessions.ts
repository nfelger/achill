import type { CalculationPosition, CalenderEvent } from "troi-library";

// how to invalidate:
// 1. shortish ttl for session-cookie
// 2. revalidate after request was send (stale-while-revalidate)

// split login & troi data sessions in two and add a ttl to the session data cookie? or save it as a session cookie?

import { createCookie, createFileSessionStorage } from "@remix-run/node";
import type { TimeEntries } from "./troi/TimeEntry";

export type SessionData = {
  username: string;
  troiPassword: string;
  troiClientId: number;
  troiEmployeeId: number;
  troiCalculationPositions: CalculationPosition[];
  troiTimeEntries: TimeEntries;
  // POST -> timeEntries.set(asd, new TimeEntry())
  // DELETE -> timeEntries.remove()
  // PUT -> timeEntries.set(asd, entry)
  troiCalendarEvents: CalenderEvent[];
};

const sessionCookie = createCookie("__session", {
  secrets: ["todo_create_a_secret_and_load_from_env"],
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createFileSessionStorage<SessionData>({
    dir: "./sessions",
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
