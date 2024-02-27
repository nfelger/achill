import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { ZodError } from "zod";
import { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import { TrackyTask } from "~/apis/tasks/TrackyTask";
import type { CalculationPosition, ProjectTime } from "~/apis/troi/Troi.types";
import {
  addProjectTime,
  deleteProjectTime,
  updateProjectTime,
} from "~/apis/troi/TroiApiController";
import { TimeInput } from "~/components/common/TimeInput";
import { TrackyButton, buttonRed } from "~/components/common/TrackyButton";
import ProjectTimeDescription from "~/components/projectTime/ProjectTimeDescription";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { projectTimeSaveFormSchema } from "~/utils/projectTimeFormValidator";

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);
  const formData = await request.formData();
  const formDataObject = Object.fromEntries(formData.entries());

  try {
    switch (formDataObject._action) {
      case "POST": {
        const parsedData = projectTimeSaveFormSchema.parse(formDataObject);
        return await addProjectTime(session, parsedData);
      }
      case "PUT": {
        if (params.id === undefined) {
          throw new Response("ProjectTime ID is required.", { status: 400 });
        }
        const id = parseInt(params.id);
        const parsedData = projectTimeSaveFormSchema.parse(formDataObject);
        return await updateProjectTime(session, id, parsedData);
      }
      case "DELETE": {
        if (params.id === undefined) {
          throw new Response("ProjectTime ID is required.", { status: 400 });
        }
        const id = parseInt(params.id);
        return await deleteProjectTime(session, id);
      }
      default:
        throw new Response("Method Not Allowed", { status: 405 });
    }
  } catch (e) {
    if (e instanceof ZodError) {
      return json(e, { status: 422 });
    }
    if (e instanceof Error && e.message === "Invalid credentials") {
      console.error("Troi auth failed", e);
      throw redirect("/login");
    }
    throw e;
  }
}

interface Props {
  date: Date;
  projectTimeId?: number;
  values?: {
    hours: string;
    description: string;
  };
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  phases: TrackyPhase[];
  calculationPosition: CalculationPosition;
  onAddProjectTime?: (projectTime: ProjectTime) => void;
  onUpdateProjectTime?: (projectTime: ProjectTime) => void;
  onDeleteProjectTime?: (projectTimeId: number) => void;
}
export function ProjectTimeForm({
  date,
  projectTimeId,
  values = {
    hours: "04:00",
    description: "",
  },
  recurringTasks,
  phaseTasks,
  phases,
  calculationPosition,
  onAddProjectTime,
  onUpdateProjectTime,
  onDeleteProjectTime,
}: Props) {
  const fetcher = useFetcher<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  const [description, setDescription] = useState(() => values.description);

  const [hours, setHours] = useState(values.hours);
  const [isEdit, setIsEdit] = useState(projectTimeId ? false : true);
  const [errors, setErrors] = useState<string[]>([]);

  function handleCancel() {
    setHours(values.hours);
    setDescription(values.description);
    setIsEdit(false);
  }

  useEffect(() => {
    if (fetcher.state !== "loading" || !fetcher.data) return;
    if ("issues" in fetcher.data) {
      setErrors(fetcher.data.issues.map((issue) => issue.message));
      return;
    } else if (fetcher.data.id && fetcher.formData) {
      const submittedProjectTime = fetcher.data;

      switch (fetcher.formData.get("_action")) {
        case "POST":
          onAddProjectTime!(submittedProjectTime as ProjectTime);
          break;
        case "PUT":
          onUpdateProjectTime!(submittedProjectTime as ProjectTime);
          setIsEdit(false);
          break;
        case "DELETE":
          onDeleteProjectTime!(submittedProjectTime.id);
          break;
        default:
          break;
      }
    }
  }, [fetcher.state]);

  return (
    <fetcher.Form
      ref={formRef}
      method="POST"
      action={`/project_time/${projectTimeId ?? ""}`}
      className="block w-full rounded-lg bg-gray-100 p-4 shadow-lg"
    >
      <h3 className="mb-4 text-gray-900">{calculationPosition.name}</h3>
      <input
        type="hidden"
        name="calculationPositionId"
        value={calculationPosition.id}
      />
      <input
        type="hidden"
        name="date"
        value={moment(date).format("YYYY-MM-DD")}
      />
      {isEdit ? (
        <>
          <div className="relative flex w-full items-center">
            <TimeInput
              name="hours"
              time={moment(hours, "HH:mm").format("HH:mm")}
              onChange={setHours}
              label="Hours"
            />
            {errors.length > 0 && (
              <ul className="mt-1 ml-2 font-bold text-red-600">
                {errors.map((error) => (
                  <li key={error}>&#x26A0; {error}</li>
                ))}
              </ul>
            )}
          </div>
          <ProjectTimeDescription
            description={description}
            setDescription={setDescription}
            recurringTasks={recurringTasks}
            phaseTasks={phaseTasks}
            phases={phases}
            calculationPositionId={calculationPosition.id}
            submitForm={() => formRef.current!.submit()}
            hasErrors={Object.values(errors).length > 0}
            resetErrors={() => setErrors([])}
          >
            {projectTimeId ? (
              <>
                <TrackyButton
                  name="_action"
                  value="PUT"
                  testId={`update-${calculationPosition.id}`}
                >
                  Update
                </TrackyButton>
                <TrackyButton
                  type="reset"
                  onClick={handleCancel}
                  color={buttonRed}
                  testId={`cancel-${calculationPosition.id}`}
                >
                  Cancel
                </TrackyButton>
              </>
            ) : (
              <TrackyButton
                name="_action"
                value="POST"
                testId={`add-${calculationPosition.id}`}
              >
                Save
              </TrackyButton>
            )}
          </ProjectTimeDescription>
        </>
      ) : (
        <div data-testid="projectTime-card-content">
          <b>{values.hours} Hour(s)</b>
          <p>{values.description}</p>
          <div className="mt-2 flex space-x-2">
            <TrackyButton
              name="_action"
              value="DELETE"
              color={buttonRed}
              testId={`delete-${calculationPosition.id}`}
            >
              Delete
            </TrackyButton>
            <TrackyButton
              type="button"
              onClick={() => setIsEdit(true)}
              testId={`edit-${calculationPosition.id}`}
            >
              Edit
            </TrackyButton>
          </div>
        </div>
      )}
    </fetcher.Form>
  );
}
