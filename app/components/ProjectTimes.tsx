import type { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import type { TrackyTask } from "~/apis/tasks/TrackyTask";
import { CalculationPosition, ProjectTime } from "~/apis/troi/troi.types";
import { convertFloatTimeToHHMM } from "~/utils/dateTimeUtils";
import { ProjectTimeForm } from "../routes/project_time.($id)";

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
  return calculationPositions.map((position) => (
    <div key={position.id} className="mb-4 container mx-auto">
      {!projectTimes.some(
        ({ calculationPositionId }) => calculationPositionId === position.id,
      ) ? (
        <ProjectTimeForm
          date={selectedDate}
          calculationPosition={position}
          recurringTasks={recurringTasks}
          phaseTasks={phaseTasks}
          phases={phasesPerCalculationPosition[position.id]}
          disabled={disabled}
        />
      ) : (
        projectTimes
          .filter(
            ({ calculationPositionId }) =>
              calculationPositionId === position.id,
          )
          .map((projectTime) => (
            <div
              key={projectTime.id}
              data-testid={`projectTimeCard-${position.id}`}
            >
              <ProjectTimeForm
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
              />
            </div>
          ))
      )}
    </div>
  ));
}
