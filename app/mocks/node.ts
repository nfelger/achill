import { setupServer } from "msw/node";
import { handlers as troiHandlers } from "./troiHandlers";
import { handlers as nocodbHandlers } from "./nocodbHandlers";

export const server = setupServer(...troiHandlers, ...nocodbHandlers);

server.events.on("request:start", ({ request }) => {
  console.log("MSW intercepted:", request.method, request.url);
});
