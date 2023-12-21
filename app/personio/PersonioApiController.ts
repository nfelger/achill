import { convertTimeStringToFloat } from "~/utils/timeConverter";
import type {
  PersonioApiEmployee,
  PersonioApiEmployees,
} from "./PersonioApiEmployee";
import moment from "moment";
import type { PersonioApiAttendance } from "./PersonioApiAttendance";

const PERSONIO_BASE_URL = "https://api.personio.de/v1";
const PERSONIO_AUTH_URL = `${PERSONIO_BASE_URL}/auth`;
const PERSONIO_EMPLOYEES_URL = `${PERSONIO_BASE_URL}/company/employees`;
const PERSONIO_ATTENDANCES_URL = `${PERSONIO_BASE_URL}/company/attendances`;

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

  console.log("[Personio API]", "POST", PERSONIO_AUTH_URL, response.status);

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

  const fetchData = async (authToken: string) => {
    const response = await fetch(input, {
      ...init,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "X-Personio-Partner-ID": PERSONIO_PARTNER_ID,
        ...init?.headers,
      },
    });
    console.log(
      "[Personio API]",
      init?.method ?? "GET",
      input.toString(),
      response.status,
    );
    return response;
  };

  const response = await fetchData(authToken);
  if (response.status === 401) {
    authToken = await getAuthToken();
    return fetchData(authToken);
  }

  return response;
}

export async function getEmployeeDataByMailAddress(mailAddress: string) {
  const url = new URL(PERSONIO_EMPLOYEES_URL);
  url.searchParams.set("email", mailAddress);

  const response = await fetchWithPersonioAuth(url);
  const employeeData: PersonioApiEmployees = await response.json();

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

export async function getEmployeeData(employeeId: number) {
  const response = await fetchWithPersonioAuth(
    `${PERSONIO_EMPLOYEES_URL}/${employeeId}`,
  );
  const employeeData: PersonioApiEmployee = await response.json();

  const schedule = employeeData.data.attributes.work_schedule.value.attributes;
  return {
    id: employeeData.data.attributes.id.value,
    workingHours: {
      monday: convertTimeStringToFloat(schedule.monday),
      tuesday: convertTimeStringToFloat(schedule.tuesday),
      wednesday: convertTimeStringToFloat(schedule.wednesday),
      thursday: convertTimeStringToFloat(schedule.thursday),
      friday: convertTimeStringToFloat(schedule.friday),
    },
  };
}

export async function getAttendances(
  employeeId: number,
  startDate: Date,
  endDate: Date,
) {
  const url = new URL(PERSONIO_ATTENDANCES_URL);
  url.searchParams.set("start_date", moment(startDate).format("YYYY-MM-DD"));
  url.searchParams.set("end_date", moment(endDate).format("YYYY-MM-DD"));
  url.searchParams.append("employees", employeeId.toString());
  url.searchParams.set("limit", "200");
  url.searchParams.set("offset", "0");

  const response = await fetchWithPersonioAuth(url);

  return (await response.json()) as PersonioApiAttendance;
}

export async function postAttendance(
  employeeId: number,
  startTime: Date,
  endTime: Date,
  breakTime: number,
  comment: string,
) {
  const response = await fetchWithPersonioAuth(PERSONIO_ATTENDANCES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      attendances: [
        {
          employee: employeeId,
          date: moment(startTime).format("YYYY-MM-DD"),
          start_time: moment(startTime).format("HH:mm"),
          end_time: moment(endTime).format("HH:mm"),
          break: breakTime,
          comment: comment,
        },
      ],
    }),
  });

  return (await response.json()) as
    | {
        success: true;
        data: {
          id: number[];
          message: "success";
        };
      }
    | {
        success: false;
        error: {
          code: number;
          message: string;
          detailed_message: unknown[];
        };
      };
}

export async function deleteAttendance(attendanceId: number) {
  const response = await fetchWithPersonioAuth(
    `${PERSONIO_ATTENDANCES_URL}/${attendanceId}`,
    {
      method: "DELETE",
    },
  );
  return (await response.json()) as
    | { success: true; data: { message: string } }
    | {
        success: false;
        error: {
          code: number;
          message: string;
        };
      };
}

export async function patchAttendance(
  attendanceId: number,
  startTime: Date,
  endTime: Date,
  breakTime: number,
  comment: string,
) {
  const response = await fetchWithPersonioAuth(
    `${PERSONIO_ATTENDANCES_URL}/${attendanceId}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        date: moment(startTime).format("YYYY-MM-DD"),
        start_time: moment(startTime).format("HH:mm"),
        end_time: moment(endTime).format("HH:mm"),
        break: breakTime,
        comment: comment,
      }),
    },
  );

  return (await response.json()) as
    | {
        success: true;
        data: [];
      }
    | {
        success: false;
        error: {
          code: number;
          message: string;
        };
      };
}
