import type {
  CalculationPosition,
  CalenderEvent,
  TimeEntry,
} from "troi-library";

// how to invalidate:
// 1. add a refresh button to the ui -> we do not need this if we use stale-while-revalidate as a normal refresh has the same effect
// 2. shortish ttl for session-cookie
// 3. revalidate after request was send (stale-while-revalidate)

// split login & troi data sessions in two and add a ttl to the session data cookie? or save it as a session cookie?

import { createCookie, createFileSessionStorage } from "@remix-run/node";

type ClientId = number;
type EmployeeId = number;
type TimeEntryId = number;

export type SessionData = {
  username: string;
  troiPassword: string;
  troiClientId: ClientId;
  troiEmployeeId: EmployeeId;
  troiCalculationPositions: CalculationPosition[];
  troiTimeEntries: Map<TimeEntryId, TimeEntry>;
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
