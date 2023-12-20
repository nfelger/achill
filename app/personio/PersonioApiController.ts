import { convertTimeStringToFloat } from "~/utils/timeConverter";
import type { PersonioApiEmployee } from "./PersonioApiEmployee";

const PERSONIO_BASE_URL = "https://api.personio.de/v1";
const PERSONIO_AUTH_URL = `${PERSONIO_BASE_URL}/auth`;
const PERSONIO_EMPLOYEES_URL = `${PERSONIO_BASE_URL}/company/employees`;

const PERSONIO_PARTNER_ID = "DIGITALSERVICE";

async function getAuthToken(): Promise<string> {
  console.log("Loading new Personio auth token...");

  const response = await fetch(PERSONIO_AUTH_URL, {
    method: "POST",
    headers: {
      "X-Personio-Partner-ID": PERSONIO_PARTNER_ID,
    },
    body: JSON.stringify({
      client_id: process.env.PERSONIO_CLIENT_ID,
      client_secret: process.env.PERSONIO_CLIENT_SECRET,
    }),
  });

  const { success, data } = (await response.json()) as {
    success: true;
    data: {
      token: string;
      expires_in: number;
      scope: string;
    };
  };

  if (!success) {
    console.error(
      "Couldn't load new Personio auth token! Is the client_id and client_secret still correct?",
    );
    throw new Error("Personio Api Auth Failed");
  }

  return data.token;
}

let authToken: string | undefined;
async function fetchWithPersonioAuth(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): Promise<Response> {
  if (authToken === undefined) {
    authToken = await getAuthToken();
  }

  const fetchData = (authToken: string) => {
    return fetch(input, {
      ...init,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "X-Personio-Partner-ID": PERSONIO_PARTNER_ID,
        ...init?.headers,
      },
    });
  };

  const response = await fetchData(authToken);
  if (response.status === 401) {
    authToken = await getAuthToken();
    return fetchData(authToken);
  }

  return response;
}

export async function getEmployeeData(mailAddress: string) {
  const url = new URL(PERSONIO_EMPLOYEES_URL);
  url.searchParams.set("email", mailAddress);

  const response = await fetchWithPersonioAuth(url);

  const employeeData: PersonioApiEmployee = await response.json();

  const schedule =
    employeeData.data[0].attributes.work_schedule.value.attributes;
  return {
    id: employeeData.data[0].attributes.id.value,
    workingHours: {
      monday: convertTimeStringToFloat(schedule.monday),
      tuesday: convertTimeStringToFloat(schedule.tuesday),
      wednesday: convertTimeStringToFloat(schedule.wednesday),
      thursday: convertTimeStringToFloat(schedule.thursday),
      friday: convertTimeStringToFloat(schedule.friday),
    },
  };
}
