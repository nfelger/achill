import {
  json,
  LinksFunction,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import TrackYourTime from "../components/TrackYourTime";
import {
  getCalculationPositions,
  getCalendarEvents,
  getTimeEntries,
} from "~/troi/troiApiController";
import { commitSession, getSessionAndThrowIfInvalid } from "~/sessions.server";
import { loadTasks } from "~/tasks/TrackyTask";
import { AuthenticationFailed } from "troi-library";
import {
  getAttendances,
  getEmployeeData,
} from "~/personio/PersonioCacheController";

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
      timeEntries,
      tasks,
      { workingHours },
      attendances,
    ] = await Promise.all([
      getCalculationPositions(session),
      getCalendarEvents(session),
      getTimeEntries(session),
      loadTasks(),
      getEmployeeData(session),
      getAttendances(session),
    ]);
    await commitSession(session);

    return json({
      username: session.get("username")!,
      calculationPositions,
      calendarEvents,
      timeEntries,
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
    timeEntries,
    tasks,
    workingHours,
    attendances,
  } = useLoaderData<typeof loader>();

  return (
    <main>
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
                  <div className="font-bold">Track-Your-Time</div>
                  <div className="text-sm">Logged in as {username}.</div>
                </div>
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    data-test="add-button"
                    className="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
                  >
                    Logout
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </nav>
        <TrackYourTime
          calendarEvents={calendarEvents}
          timeEntries={timeEntries}
          calculationPositions={calculationPositions}
          tasks={tasks}
          workingHours={workingHours}
          attendances={attendances}
        />
      </div>
    </main>
  );
}
