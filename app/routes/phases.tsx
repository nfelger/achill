import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { loadPhases } from "~/tasks/TrackyPhase";
import { getCalculationPositions } from "~/troi/troiApiController";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);

  const url = new URL(request.url);
  if (!url.searchParams.has("calculationPositionId")) {
    throw new Response("Missing calculationPositionId", { status: 400 });
  }
  const calculationPositionId = parseInt(
    url.searchParams.get("calculationPositionId")!,
    10,
  );

  const calculationPositions = await getCalculationPositions(session, false);
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
