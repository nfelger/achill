import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useFetchers, useLoaderData } from "@remix-run/react";
import { TrackyPhase, loadPhases } from "~/apis/tasks/TrackyPhase";
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
    const { personioId, workingHours } = session.get("personioEmployee");

    // await all the promises in parallel
    const [
      calendarEvents,
      calculationPositions,
      projectTimes,
      attendances,
      tasks,
    ] = await Promise.all([
      // TROI API calls
      getCalendarEvents(session),
      getCalculationPositions(session),
      getProjectTimes(session),
      // PERSONIO API call
      getAttendances(personioId),
      // NOCODB API call
      loadTasks(),
    ]);

    // load phases for each calculation position in parallel
    const phasesPerCalculationPosition = Object.fromEntries(
      await Promise.all(
        calculationPositions.map(async (calculationPosition) => [
          [calculationPosition.id],
          await loadPhases(
            calculationPosition.id,
            calculationPosition.subprojectId,
          ),
        ]),
      ),
    );

    return json({
      timestamp: Date.now(),
      username: session.get("username")!,
      calculationPositions,
      calendarEvents,
      projectTimes,
      tasks,
      phasesPerCalculationPosition,
      workingHours,
      attendances,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      console.error("Authentication failed", error);
      throw redirect("/login");
    }

    throw error;
  }
}

export default function Index() {
  const {
    timestamp,
    username,
    calculationPositions,
    calendarEvents,
    projectTimes,
    tasks,
    phasesPerCalculationPosition,
    workingHours,
    attendances,
  } = useLoaderData<typeof loader>();

  const anyFetcherSubmitting = useFetchers().some(
    (fetcher) => fetcher.state === "submitting",
  );

  return (
    <div className="container mx-auto mt-8 w-full max-w-screen-lg text-sm text-gray-800 sm:px-2">
      <main className="rounded-sm bg-white p-2 shadow-md sm:w-full md:px-8 md:py-6">
        {anyFetcherSubmitting && <LoadingOverlay message="Loading data..." />}
        <nav className="flex h-16 justify-between border-1 w-full border-b pb-1 text-left">
          <img
            src="timetracking_blue.svg"
            alt="Track-Your-Time logo"
            className="pr-4 py-1"
          />
          <div className="flex w-full items-center justify-between">
            <div className="text-black">
              <h1 className="font-bold">Track-Your-Time</h1>
              <div className="text-sm">Logged in as {username}.</div>
            </div>
            <Form method="post" action="/logout">
              <TrackyButton testId="logout-button">Logout</TrackyButton>
            </Form>
          </div>
        </nav>
        <TrackYourTime
          timestamp={timestamp}
          calendarEvents={calendarEvents}
          projectTimes={projectTimes}
          calculationPositions={calculationPositions}
          tasks={tasks}
          phasesPerCalculationPosition={phasesPerCalculationPosition}
          workingHours={workingHours}
          attendances={attendances}
        />
      </main>
    </div>
  );
}
