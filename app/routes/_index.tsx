import {
  json,
  LinksFunction,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useFetchers, useLoaderData } from "@remix-run/react";
import TrackYourTime from "../components/TrackYourTime";
import {
  getCalculationPositions,
  getCalendarEvents,
  getProjectTimes,
} from "~/apis/troi/troiApiController";
import { commitSession, getSessionAndThrowIfInvalid } from "~/sessions.server";
import { loadTasks } from "~/apis/tasks/TrackyTask";
import { AuthenticationFailed } from "troi-library";
import {
  getAttendances,
  getEmployeeData,
} from "~/apis/personio/PersonioCacheController";
import { LoadingOverlay } from "~/components/common/LoadingOverlay";
import { TrackyButton } from "~/components/common/TrackyButton";

export const meta: MetaFunction = () => {
  return [
    { title: "Track your time" },
    { name: "description", content: "Hello DigitalService!" },
  ];
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);

  try {
    // await all the promises in parallel
    const [
      calculationPositions,
      calendarEvents,
      projectTimesById,
      tasks,
      { workingHours },
      attendances,
    ] = await Promise.all([
      // TROI API calls
      getCalculationPositions(session),
      getCalendarEvents(session),
      getProjectTimes(session),
      // NOCODB API call
      loadTasks(),
      // PERSONIO API calls
      getEmployeeData(session),
      getAttendances(session),
    ]);

    await commitSession(session);

    return json({
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
      throw redirect("/login");
    }

    throw e;
  }
}

export default function Index() {
  const {
    username,
    calculationPositions,
    calendarEvents,
    projectTimesById,
    tasks,
    workingHours,
    attendances,
  } = useLoaderData<typeof loader>();

  const anyFetcherNotIdle = useFetchers().some(
    (fetcher) => fetcher.state !== "idle",
  );

  return (
    <main>
      {anyFetcherNotIdle && <LoadingOverlay message="Loading data..." />}
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
          calendarEvents={calendarEvents}
          projectTimesById={projectTimesById}
          calculationPositions={calculationPositions}
          tasks={tasks}
          workingHours={workingHours}
          attendances={attendances}
        />
      </div>
    </main>
  );
}
