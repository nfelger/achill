import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "~/cookies.server";
import Troi from "../components/troi.client";
import { useEffect, useState } from "react";
import TroiApiService from "troi-library";
import {
  formatDateToYYYYMMDD,
  getWeekDaysFor,
  addDaysToDate,
} from "~/utils/dateUtils";

let isHydrating = true;

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Application Template" },
    { name: "description", content: "Hello DigitalService!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) || {};

  const _troiApi = new TroiApiService({
    baseUrl: "https://digitalservice.troi.software/api/v2/rest",
    clientName: "DigitalService GmbH des Bundes",
    username: cookie.username,
    password: cookie.password,
  });

  const _projects = await _troiApi
    .makeRequest({
      url: "/calculationPositions",
      params: {
        clientId: (await _troiApi.getClientId()).toString(),
        favoritesOnly: true.toString(),
      },
    })
    .then((response) =>
      (response as any).map((obj: unknown) => {
        return {
          name: (obj as any).DisplayPath,
          id: (obj as any).Id,
          subproject: (obj as any).Subproject.id,
        };
      }),
    );
  console.log(_projects);

  const fetchStartDate = addDaysToDate(getWeekDaysFor(new Date())[0], -365); // monday a year before
  const fetchEndDate = getWeekDaysFor(new Date())[4]; // current week friday

  console.log(fetchStartDate);
  console.log(fetchEndDate);

  for (const project of _projects) {
    const entries = (await _troiApi.makeRequest({
      url: "/billings/hours",
      params: {
        clientId: (await _troiApi.getClientId()).toString(),
        employeeId: (await _troiApi.getEmployeeId()).toString(),
        calculationPositionId: project.id,
        startDate: formatDateToYYYYMMDD(fetchStartDate),
        endDate: formatDateToYYYYMMDD(fetchEndDate),
      },
    })) as any[];
    entries
      .map((obj) => {
        return {
          id: obj.id,
          date: obj.Date,
          hours: obj.Quantity,
          description: obj.Remark,
        };
      })
      .sort((a, b) => (a.date > b.date ? 1 : -1));
    console.log(project.id, entries.length);
  }

  return json({ username: cookie.username, password: cookie.password });
}

export default function Index() {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);
  const { username, password } = useLoaderData<typeof loader>();

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

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
        {/* render client side only */}
        {/* https://remix.run/docs/en/main/guides/migrating-react-router-app#client-only-components */}
        {isHydrated && <Troi username={username} password={password} />}
      </div>
    </main>
  );
}
