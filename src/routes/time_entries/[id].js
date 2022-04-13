import TroiApiService from "../../lib/troiApiService";

export async function del({ params, request }) {
  const id = params.id;
  const userName = request.headers.get("x-troi-username");
  const password = request.headers.get("x-troi-password");
  const troi = new TroiApiService(userName, password);
  await troi.deleteTimeEntry(id);
  return {
    body: params.id,
  };
}
