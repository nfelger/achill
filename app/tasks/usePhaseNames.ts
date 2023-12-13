import { useEffect, useState } from "react";
import nocodbApi from "./nocodbClient";

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

type TrackyPhase = {
  Id: number;
  "Phase ID": number;
  "Phase Name": string;
  Divider: unknown;
};

export function usePhaseNames(positionId: number, subprojectId: number) {
  // note: this pattern could lead to race conditions when positionId or subprojectId change
  const [phaseNames, setPhaseNames] = useState<string[]>([]);

  useEffect(() => {
    loadPhases(positionId, subprojectId).then((phases) => {
      setPhaseNames(phases.map((phase) => phase["Phase Name"]));
    });
  }, [positionId, subprojectId]);

  return phaseNames;
}

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

async function loadPhases(
  positionId: number,
  subprojectId: number,
): Promise<TrackyPhase[]> {
  let whereClause: string[] = [];

  const positionPhases = await loadPostionPhases(positionId);
  positionPhases.forEach((phase) =>
    whereClause.push(`(Phase ID,eq,${phase["Phase ID"]})`),
  );

  const subprojectPhases = await loadSubprojectPhases(subprojectId);
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
