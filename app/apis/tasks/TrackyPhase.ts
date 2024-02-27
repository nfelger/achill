import nocodbApi from "./nocodbClient.server";

type TrackyPositionPhase = {
  Id: number;
  "Phase ID": number;
  "Position ID": string;
};

type TrackySubprojectPhase = {
  Id: number;
  "Subproject ID": number;
  "Phase ID": number;
};

export type TrackyPhase = {
  Id: number;
  "Phase ID": number;
  "Phase Name": string;
  Divider: unknown;
};

async function loadPostionPhases(
  positionId: number,
): Promise<TrackyPositionPhase[]> {
  const positionPhases = await nocodbApi.dbViewRow.list(
    "noco",
    "ds4g-data",
    "Tracky-Position-Phase",
    "Tracky-Position-Phase",
    {
      where: `(Position ID,eq,${positionId})`,
    },
  );
  return positionPhases.list as TrackyPositionPhase[];
}

async function loadSubprojectPhases(
  subprojectId: number,
): Promise<TrackySubprojectPhase[]> {
  const subprojectPhases = await nocodbApi.dbViewRow.list(
    "noco",
    "ds4g-data",
    "Tracky-Subproject-Phase",
    "Tracky-Subproject-Phase",
    {
      where: `(Subproject ID,eq,${subprojectId})`,
    },
  );
  return subprojectPhases.list as TrackySubprojectPhase[];
}

export async function loadPhases(
  positionId: number,
  subprojectId: number,
): Promise<TrackyPhase[]> {
  let whereClause: string[] = [];

  const [positionPhases, subprojectPhases] = await Promise.all([
    loadPostionPhases(positionId),
    loadSubprojectPhases(subprojectId),
  ]);

  positionPhases.forEach((phase) =>
    whereClause.push(`(Phase ID,eq,${phase["Phase ID"]})`),
  );
  subprojectPhases.forEach((phase) =>
    whereClause.push(`(Phase ID,eq,${phase["Phase ID"]})`),
  );

  if (whereClause.length === 0) {
    return [];
  }

  const trackyPhases = await nocodbApi.dbViewRow.list(
    "noco",
    "ds4g-data",
    "Tracky-Phase",
    "Tracky-Phase",
    {
      where: whereClause.join("~or"),
    },
  );

  return trackyPhases.list as TrackyPhase[];
}