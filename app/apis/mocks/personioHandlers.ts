import { HttpResponse, http } from "msw";

export const handlers = [
  http.post("https://api.personio.de/v1/auth", () => {
    return HttpResponse.json(require("./stubs/personio/auth.json"));
  }),
  http.get("https://api.personio.de/v1/company/employees", () => {
    return HttpResponse.json(require("./stubs/personio/employees.json"));
  }),
  http.get("https://api.personio.de/v1/company/employees/:id", () => {
    return HttpResponse.json(require("./stubs/personio/employee.json"));
  }),
  http.get("https://api.personio.de/v1/company/attendances", () => {
    return HttpResponse.json(require("./stubs/personio/attendances.json"));
  }),
];
