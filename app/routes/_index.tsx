import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useFetchers, useLoaderData } from "@remix-run/react";
import { AuthenticationFailed } from "troi-library";
import { loadTasks } from "~/apis/tasks/TrackyTask";
import {
  getCalculationPositions,
  getCalendarEvents,
  getProjectTimes,
} from "~/apis/troi/troiApiController";
import { LoadingOverlay } from "~/components/common/LoadingOverlay";
import { TrackyButton } from "~/components/common/TrackyButton";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { getAttendances } from "../apis/personio/PersonioApiController";
import TrackYourTime from "../components/TrackYourTime";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);

  try {
    // await all the promises in parallel
    const { personioId, workingHours } = session.get("personioEmployee");

    const [
      calculationPositions,
      calendarEvents,
      projectTimesById,
      tasks,
      attendances,
    ] = await Promise.all([
      // TROI API calls
      getCalculationPositions(session),
      getCalendarEvents(session),
      getProjectTimes(session),
      // NOCODB API call
      loadTasks(),
      // PERSONIO API call
      getAttendances(personioId),
    ]);

    return json({
      timestamp: Date.now(),
      username: session.get("username")!,
      calculationPositions,
      calendarEvents,
      projectTimesById,
      tasks,
      workingHours,
      attendances,
    });
  } catch (e) {
    if (e instanceof AuthenticationFailed) {
      console.error("Authentication failed", e);
      throw redirect("/login");
    }

    throw e;
  }
}

export default function Index() {
  const {
    timestamp,
    username,
    calculationPositions,
    calendarEvents,
    projectTimesById,
    tasks,
    workingHours,
    attendances,
  } = useLoaderData<typeof loader>();

  const anyFetcherSubmitting = useFetchers().some(
    (fetcher) => fetcher.state === "submitting",
  );

  return (
    <div className="container mx-auto mt-8 w-full max-w-screen-lg text-sm text-gray-800 sm:px-2">
      <main>
        {anyFetcherSubmitting && <LoadingOverlay message="Loading data..." />}
        <div className="rounded-sm bg-white px-2 py-2 shadow-md sm:w-full md:px-8 md:py-6">
          <nav className="border-1 w-full border-b pb-1 text-center md:text-left">
            <div className=" ">
              <div className="flex h-16 justify-between">
                <div className="flex items-center">
                  <img
                    src="timetracking_blue.svg"
                    alt="Track-Your-Time logo"
                    className="p-4"
                  />
                </div>
                <div className="flex w-full items-center justify-between">
                  <div className="text-black">
                    <h1 className="font-bold">Track-Your-Time</h1>
                    <div className="text-sm">Logged in as {username}.</div>
                  </div>
                  <Form method="post" action="/logout">
                    <TrackyButton testId="logout-button">Logout</TrackyButton>
                  </Form>
                </div>
              </div>
            </div>
          </nav>
          <TrackYourTime
            timestamp={timestamp}
            calendarEvents={calendarEvents}
            projectTimesById={projectTimesById}
            calculationPositions={calculationPositions}
            tasks={tasks}
            workingHours={workingHours}
            attendances={attendances}
          />
        </div>
      </main>
    </div>
  );
}
