import { HttpResponse, http, passthrough } from "msw";
import md5 from "crypto-js/md5.js";

export const handlers = [
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calculationPositions",
    () => {
      return HttpResponse.json(require("./stubs/calculationPositions.json"));
    },
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/clients",
    ({ request }) => {
      const expectedAuthHeader =
        "Basic " + btoa(`max.mustermann:${md5("aSafePassword")}`);
      if (request.headers.get("authorization") === expectedAuthHeader) {
        return HttpResponse.json(require("./stubs/clients.json"));
      } else {
        return new HttpResponse(null, { status: 403 });
      }
    },
  ),
  http.get("https://digitalservice.troi.software/api/v2/rest/employees", () => {
    return HttpResponse.json(require("./stubs/employees.json"));
  }),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calendarEvents",
    () => {
      return HttpResponse.json(require("./stubs/calendarEvents.json"));
    },
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours",
    ({ request }) => {
      switch (new URLSearchParams(request.url).get("calculationPositionId")) {
        case "4":
          return HttpResponse.json(require("./stubs/billings_hours_4.json"));
        case "7":
          return HttpResponse.json(require("./stubs/billings_hours_7.json"));
      }

      return passthrough();
    },
  ),
];
