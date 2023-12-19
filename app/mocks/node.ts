import { setupServer } from "msw/node";
import { handlers as troiHandlers } from "./troiHandlers";
import { handlers as nocodbHandlers } from "./nocodbHandlers";

export const server = setupServer(...troiHandlers, ...nocodbHandlers);
