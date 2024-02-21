import type { Session } from "@remix-run/node";
import moment from "moment";
import TroiApiService from "troi-library";
import { END_DATE, START_DATE } from "~/utils/dateTimeUtils";
import type {
  CalculationPosition,
  TroiProjectTime,
  TroiProjectTimesById,
} from "./troi.types";

const BASE_URL = "https://digitalservice.troi.software/api/v2/rest";
const CLIENT_NAME = "DigitalService GmbH des Bundes";
const START_DATE_YYYYMMDD = moment(START_DATE).format("YYYYMMDD");
const END_DATE_YYYYMMDD = moment(END_DATE).format("YYYYMMDD");

async function getInitializedTroiApi(
  session: Session,
): Promise<TroiApiService> {
  const troiApi = new TroiApiService({
    baseUrl: BASE_URL,
    clientName: CLIENT_NAME,
    username: session.get("username"),
    password: session.get("troiPassword"),
  });
  troiApi.clientId = session.get("troiClientId");
  troiApi.employeeId = session.get("troiEmployeeId");
  return troiApi;
}

export async function getCalculationPositions(session: Session) {
  const troiApi = await getInitializedTroiApi(session);

  console.log("[TroiAPI]", "GET /calculationPositions");
  const calculationPositions: CalculationPosition[] = (
    (await troiApi.makeRequest({
      url: "/calculationPositions",
      params: {
        clientId: troiApi.clientId!.toString(),
        favoritesOnly: true.toString(),
      },
    })) as {
      Id: number;
      DisplayPath: string;
      Subproject: {
        id: number;
      };
    }[]
  ).map((obj) => ({
    name: obj.DisplayPath,
    id: obj.Id,
    subprojectId: obj.Subproject.id,
  }));

  return calculationPositions;
}

export async function getCalendarEvents(session: Session) {
  const troiApi = await getInitializedTroiApi(session);

  console.log("[TroiAPI]", "getCalendarEvents()");
  return await troiApi.getCalendarEvents(
    START_DATE_YYYYMMDD,
    END_DATE_YYYYMMDD,
  );
}

export async function getProjectTimes(
  session: Session,
  calculationPositions: CalculationPosition[],
) {
  const troiApi = await getInitializedTroiApi(session);

  const projectTimes: TroiProjectTime[] = (
    await Promise.all(
      calculationPositions.map((calcPos: CalculationPosition) => {
        console.log(
          "[TroiAPI]",
          `GET /billings/hours for CalculationPosition ${calcPos.id}`,
        );

        return troiApi.makeRequest({
          url: "/billings/hours",
          params: {
            clientId: troiApi.clientId!.toString(),
            employeeId: troiApi.employeeId!.toString(),
            calculationPositionId: calcPos.id.toString(),
            startDate: START_DATE_YYYYMMDD,
            endDate: END_DATE_YYYYMMDD,
          },
        }) as Promise<{
          id: number;
          Date: string;
          Quantity: string;
          Remark: string;
          CalculationPosition: CalculationPosition;
        }>;
      }),
    )
  )
    .flat()
    .map((projectTime) => {
      return {
        id: projectTime.id,
        date: projectTime.Date,
        hours: parseFloat(projectTime.Quantity),
        description: projectTime.Remark,
        calculationPosition: projectTime.CalculationPosition.id,
      };
    });

  const projectTimesById: TroiProjectTimesById = {};
  for (const projectTime of projectTimes) {
    projectTimesById[projectTime.id] = projectTime;
  }

  return projectTimesById;
}

export async function addProjectTime(
  session: Session,
  calculationPostionId: number,
  date: string,
  hours: number,
  description: string,
) {
  const troiApi = await getInitializedTroiApi(session);

  console.log("[TroiAPI]", "postTimeEntry()");
  return (await troiApi.postTimeEntry(
    calculationPostionId,
    date,
    hours,
    description,
  )) as {
    id: number;
    Name: string;
    Quantity: string;
  };
}

export async function updateProjectTime(
  session: Session,
  id: number,
  hours: number,
  description: string,
) {
  const troiApi = await getInitializedTroiApi(session);

  const payload = {
    Client: {
      Path: `/clients/${troiApi.clientId}`,
    },
    Employee: {
      Path: `/employees/${troiApi.employeeId}`,
    },
    Quantity: hours,
    Remark: description,
  };

  console.log("[TroiAPI]", `PUT /billings/hours/${id}`);
  return (await troiApi.makeRequest({
    url: `/billings/hours/${id}`,
    headers: { "Content-Type": "application/json" },
    method: "PUT",
    body: JSON.stringify(payload),
  })) as {
    Name: string;
    Quantity: string;
  };
}

export async function deleteProjectTime(session: Session, id: number) {
  const troiApi = await getInitializedTroiApi(session);

  console.log("[TroiAPI]", "deleteTimeEntry()");
  return await troiApi.deleteTimeEntry(id);
}
