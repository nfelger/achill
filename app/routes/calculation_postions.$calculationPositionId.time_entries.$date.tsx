import { ActionFunctionArgs } from "@remix-run/node";
import TroiApiService from "troi-library";
import { login } from "~/cookies.server";
import { addTimeEntry } from "~/troi/troiControllerServer";

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Error("MethodNotAllowed");
    // todo (Malte Laukötter, 2023-12-15): throw a error with the correct error type (405)
  }

  if (params.calculationPositionId === undefined) {
    throw new Error("Missing calculationPositionId");
  }

  if (params.date === undefined) {
    throw new Error("Missing date");
  }

  const body = await request.formData();

  const hours = body.get("hours");
  if (typeof hours !== "string") {
    throw new Error("Missing hours");
  }

  const description = body.get("description");
  if (typeof description !== "string") {
    throw new Error("Missing description");
  }

  addTimeEntry(
    request,
    parseInt(params.calculationPositionId, 10),
    params.date,
    parseFloat(hours),
    description,
  );

  return;
}
