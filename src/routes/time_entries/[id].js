import TroiApiService from "../../lib/troiApiService";

const troiBaseUrl = "https://digitalservice.troi.software/api/v2/rest";

export async function del({ params, request }) {
  const id = params.id;
  const userName = request.headers.get("x-troi-username");
  const password = request.headers.get("x-troi-password");
  const troi = new TroiApiService(troiBaseUrl, userName, password);
  await troi.deleteTimeEntry(id);
  return {
    body: params.id,
  };
}
