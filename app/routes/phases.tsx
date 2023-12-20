import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { isSessionValid } from "~/sessions.server";
import { loadPhases } from "~/tasks/TrackyPhase";
import { getCalculationPositions } from "~/troi/troiApiController";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (!url.searchParams.has("calculationPositionId")) {
    throw new Response("Missing calculationPositionId", { status: 400 });
  }
  const calculationPositionId = parseInt(
    url.searchParams.get("calculationPositionId")!,
    10,
  );

  if (!(await isSessionValid(request))) {
    throw redirect("/login");
  }

  const calculationPositions = await getCalculationPositions(request, false);
  const calculationPosition = calculationPositions.find(
    ({ id }) => id === calculationPositionId,
  );
  if (calculationPosition === undefined) {
    throw new Response(
      `Could not find calculationPosition with id ${calculationPositionId}`,
      { status: 404 },
    );
  }

  const phases = await loadPhases(
    calculationPositionId,
    calculationPosition.subprojectId,
  );

  return json(phases);
}
