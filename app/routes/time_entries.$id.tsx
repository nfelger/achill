import { ActionFunctionArgs } from "@remix-run/node";
import TroiApiService from "troi-library";
import { login } from "~/cookies.server";

export async function action({ request, params }: ActionFunctionArgs) {
  if (!params.id) {
    throw new Error("entry id required");
  }

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) || {};

  const troi = new TroiApiService({
    baseUrl: "https://digitalservice.troi.software/api/v2/rest",
    clientName: "DigitalService GmbH des Bundes",
    username: cookie.username,
    password: cookie.password,
  });

  await troi.deleteTimeEntry(Number.parseInt(params.id));
  return params.id;
}
