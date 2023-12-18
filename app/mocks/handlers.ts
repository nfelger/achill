import { HttpResponse, http, passthrough } from "msw";

export const handlers = [
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calculationPositions",
    () => {
      return HttpResponse.json(require("./stubs/calculationPositions.json"));
    },
  ),
  http.get("https://digitalservice.troi.software/api/v2/rest/clients", () => {
    return HttpResponse.json(require("./stubs/clients.json"));
  }),
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
