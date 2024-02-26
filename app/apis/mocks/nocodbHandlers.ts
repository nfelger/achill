import { HttpResponse, http } from "msw";

export const handlers = [
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Position-Phase/views/Tracky-Position-Phase`,
    ({ request }) => {
      switch (new URL(request.url).searchParams.get("where")) {
        case "(Position ID,eq,4)":
          return HttpResponse.json(
            require("./stubs/nocodb/Tracky-Position-Phase_4.json"),
          );
        case "(Position ID,eq,7)":
          return HttpResponse.json(
            require("./stubs/nocodb/Tracky-Position-Phase_7.json"),
          );
      }
    },
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Subproject-Phase/views/Tracky-Subproject-Phase`,
    ({ request }) => {
      switch (new URL(request.url).searchParams.get("where")) {
        case "(Subproject ID,eq,14)":
          return HttpResponse.json(
            require("./stubs/nocodb/Tracky-Subproject-Phase_14.json"),
          );
        case "(Subproject ID,eq,17)":
          return HttpResponse.json(
            require("./stubs/nocodb/Tracky-Subproject-Phase_17.json"),
          );
      }
    },
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Phase/views/Tracky-Phase`,
    () => {
      return HttpResponse.json(require("./stubs/nocodb/Tracky-Phase.json"));
    },
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/v1/ds4g-data/Tracky-Task`,
    () => {
      return HttpResponse.json(require("./stubs/nocodb/Tracky-Task.json"));
    },
  ),
];
