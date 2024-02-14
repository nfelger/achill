import { convertFloatTimeToHHMM } from "~/utils/dateTimeUtils";
import { ProjectTimeForm } from "./ProjectTimeForm";
import { TrackyTask } from "~/apis/tasks/TrackyTask";
import { CalculationPosition } from "~/apis/troi/troi.types";
import { TroiProjectTime } from "~/apis/troi/troi.types";

interface Props {
  selectedDate: Date;
  calculationPositions: CalculationPosition[];
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  projectTimes: TroiProjectTime[];
  disabled: boolean;
}

export function ProjectTimes({
  selectedDate,
  calculationPositions,
  recurringTasks,
  phaseTasks,
  projectTimes,
  disabled = false,
}: Props) {
  return calculationPositions.map((position) => (
    <section
      key={position.id}
      className="bg-white"
      data-testid={`project-section-${position.id}`}
    >
      <div className="container mx-auto pb-2">
        {!projectTimes.some(
          ({ calculationPosition }) => calculationPosition === position.id,
        ) ? (
          <ProjectTimeForm
            date={selectedDate}
            calculationPosition={position}
            recurringTasks={recurringTasks}
            phaseTasks={phaseTasks}
            disabled={disabled}
          />
        ) : (
          projectTimes
            .filter(
              ({ calculationPosition }) => calculationPosition === position.id,
            )
            .map((projectTime) => (
              <div
                key={projectTime.id}
                data-testid={`projectTimeCard-${position.id}`}
              >
                <div
                  data-test="projectTime-form"
                  className="my-2 flex justify-center"
                >
                  <div className="block w-full">
                    <ProjectTimeForm
                      date={selectedDate}
                      projectTimeId={projectTime.id}
                      values={{
                        hours: convertFloatTimeToHHMM(projectTime.hours),
                        description: projectTime.description,
                      }}
                      recurringTasks={recurringTasks}
                      phaseTasks={phaseTasks}
                      calculationPosition={position}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </section>
  ));
}
