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
import { TrackyButton, buttonRed } from "~/components/common/TrackyButton";
import ProjectTimeDescription from "~/components/projectTime/ProjectTimeDescription";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { convertFloatTimeToHHMM } from "~/utils/dateTimeUtils";
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
  calculationPosition: CalculationPosition;
  projectTime?:
    | ProjectTime
    | {
        hours: number;
        description: string;
        isBillable: boolean;
      };
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  phases: TrackyPhase[];
  onAddProjectTime?: (projectTime: ProjectTime) => void;
  onUpdateProjectTime?: (projectTime: ProjectTime) => void;
  onDeleteProjectTime?: (projectTimeId: number) => void;
}
export function ProjectTimeForm({
  date,
  calculationPosition,
  projectTime = {
    hours: 0,
    description: "",
    isBillable: calculationPosition.isBillable,
  },
  recurringTasks,
  phaseTasks,
  phases,
  onAddProjectTime,
  onUpdateProjectTime,
  onDeleteProjectTime,
}: Props) {
  const fetcher = useFetcher<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  const isCreate = !("id" in projectTime);
  const [isEdit, setIsEdit] = useState(isCreate);
  const initialHours = isCreate
    ? ""
    : convertFloatTimeToHHMM(projectTime.hours);
  const [hours, setHours] = useState(initialHours);
  const [description, setDescription] = useState(projectTime.description);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (fetcher.state !== "loading" || !fetcher.data) return;
    if ("issues" in fetcher.data) {
      const errors = fetcher.data.issues.reduce(
        (errors, issue) => ({
          ...errors,
          [issue.path[0]]: issue.message,
        }),
        {},
      );
      setValidationErrors(errors);
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
      }
    }
  }, [fetcher.state]);

  function saveForm() {
    if (!formRef.current) return;
    const method = isCreate ? "PUT" : "POST";
    const formData = new FormData(formRef.current);
    formData.append("_action", method);
    fetcher.submit(formData, {
      method,
      action: `/project_time/${isCreate ? "" : projectTime.id}`,
    });
  }

  async function onKeyDown(e: React.KeyboardEvent) {
    // allow shift + enter to add newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // dont add newline on enter
      saveForm();
    }
  }

  function handleCancel() {
    setHours(initialHours);
    setDescription(projectTime.description);
    setIsEdit(false);
  }

  function resetError(errorKey: string) {
    const { [errorKey]: _, ...rest } = validationErrors;
    setValidationErrors(rest);
  }

  return (
    <fetcher.Form
      ref={formRef}
      method="POST"
      className="block w-full mb-4 rounded-lg bg-gray-100 p-4 shadow-lg"
      action={`/project_time/${isCreate ? "" : projectTime.id}`}
    >
      <h3 className="mb-4 text-base text-gray-900">
        {calculationPosition.name}
      </h3>
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
          <div className="flex w-full items-center mb-3">
            <div className="flex items-center">
              <label htmlFor="hours" className="mr-4">
                Hours
              </label>
              <input
                name="hours"
                value={hours}
                onKeyDown={onKeyDown}
                onChange={(e) => {
                  resetError("hours");
                  setHours(e.target.value);
                }}
                type="text"
                id="hours"
                className={`${validationErrors.hours ? "error " : ""}w-20`}
                placeholder="2:15"
              />
            </div>
            {Object.entries(validationErrors).length > 0 && (
              <ul className="mt-1 ml-2 font-bold text-red-600">
                {Object.entries(validationErrors).map(([key, value]) => (
                  <li key={key}>&#x26A0; {value}</li>
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
            onKeyDown={onKeyDown}
            hasErrors={!!validationErrors.description}
            resetErrors={() => resetError("description")}
          >
            {isCreate ? (
              <TrackyButton
                name="_action"
                value="POST"
                testId={`add-${calculationPosition.id}`}
              >
                Save
              </TrackyButton>
            ) : (
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
            )}
          </ProjectTimeDescription>
        </>
      ) : (
        <div data-testid="projectTime-card-content">
          <b>{projectTime.hours} Hour(s)</b>
          <p>{projectTime.description}</p>
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
