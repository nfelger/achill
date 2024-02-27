import type { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import type { TrackyTask } from "~/apis/tasks/TrackyTask";
import type { CalculationPosition, ProjectTime } from "~/apis/troi/troi.types";
import { convertFloatTimeToHHMM } from "~/utils/dateTimeUtils";
import { ProjectTimeForm } from "../routes/project_time.($id)";
import { findProjectTimesOfDate } from "./TrackYourTime";

interface Props {
  selectedDate: Date;
  calculationPositions: CalculationPosition[];
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  phasesPerCalculationPosition: Record<number, TrackyPhase[]>;
  projectTimes: ProjectTime[];
  setProjectTimes: (projectTimes: ProjectTime[]) => void;
  disabled: boolean;
}

export function ProjectTimes({
  selectedDate,
  calculationPositions,
  recurringTasks,
  phaseTasks,
  phasesPerCalculationPosition,
  projectTimes,
  setProjectTimes,
  disabled = false,
}: Props) {
  function addProjectTime(projectTime: ProjectTime) {
    setProjectTimes([...projectTimes, projectTime]);
  }

  function updateProjectTime(projectTime: ProjectTime) {
    setProjectTimes(
      projectTimes.map((pt) => (pt.id === projectTime.id ? projectTime : pt)),
    );
  }

  function deleteProjectTime(projectTimeId: number) {
    setProjectTimes(projectTimes.filter((pt) => pt.id !== projectTimeId));
  }

  const projectTimesForSelectedDate = findProjectTimesOfDate(
    projectTimes,
    selectedDate,
  );

  const timesForCalculationPosition = calculationPositions.map((position) => ({
    position,
    projectTimes: projectTimesForSelectedDate.filter(
      (pt) => pt.calculationPositionId === position.id,
    ),
  }));

  return timesForCalculationPosition.map(({ position, projectTimes }) => (
    <div key={position.id} className="mb-4 container mx-auto">
      {projectTimes.length ? (
        projectTimes.map((projectTime) => (
          <ProjectTimeForm
            key={projectTime.id}
            date={selectedDate}
            projectTimeId={projectTime.id}
            values={{
              hours: convertFloatTimeToHHMM(projectTime.hours),
              description: projectTime.description,
            }}
            recurringTasks={recurringTasks}
            phaseTasks={phaseTasks}
            phases={phasesPerCalculationPosition[position.id]}
            calculationPosition={position}
            disabled={disabled}
            onUpdateProjectTime={updateProjectTime}
            onDeleteProjectTime={deleteProjectTime}
            data-testid={`projectTimeCard-${position.id}`}
          />
        ))
      ) : (
        <ProjectTimeForm
          date={selectedDate}
          calculationPosition={position}
          recurringTasks={recurringTasks}
          phaseTasks={phaseTasks}
          phases={phasesPerCalculationPosition[position.id]}
          disabled={disabled}
          onAddProjectTime={addProjectTime}
        />
      )}
    </div>
  ));
}
