declare module "troi-library" {
  export class AuthenticationFailed extends Error {
    constructor();
  }
  export type TimeEntry = {
    id: number;
    date: string;
    hours: number;
    description: string;
  };
  export type CalendarEventType = "R" | "H" | "G" | "P" | "T";
  export type CalendarEvent = {
    id: string;
    startDate: string;
    endDate: string;
    subject: string;
    type: CalendarEventType;
  };
  export type CalculationPosition = {
    name: string;
    id: number;
  };
  /**
   * Creates an instance of the TroiApiService.
   * @class
   */
  export default class TroiApiService {
    baseUrl: string;
    clientName: string;
    username: string;
    password: string;
    authHeader: {
      Authorization: string;
    };
    clientId?: number;
    employeeId?: number;
    /**
     * @constructor
     * @param {Object} initializationObject - An object to initialize the service
     * @param {string} initializationObject.baseUrl - The troi url for your company
     * @param {string} initializationObject.clientName - The clientName to get the company id for bookings
     * @param {string} initializationObject.username - The username to be used for all operations
     * @param {string} initializationObject.password - The users password to be used for all operations
     */
    constructor({
      baseUrl,
      clientName,
      username,
      password,
    }: {
      baseUrl: string;
      clientName: string;
      username: string;
      password: string;
    });
    /**
     * @name initialize
     * @description initialization of the service
     */
    initialize(): Promise<void>;
    /**
     *
     * @name getClientId
     * @description retrieve the id of the client for future operations
     * @returns {Promise<number>} the clientId
     */
    getClientId(): Promise<number>;
    /**
     *
     * @name getEmployeeId
     * @description retrieve the id of the employee for future operations
     * @returns {Promise<number>} the employeeId
     */
    getEmployeeId(): Promise<number>;
    getCalculationPositions(
      favouritesOnly?: boolean,
    ): Promise<CalculationPosition[]>;
    getTimeEntries(
      calculationPositionId: number,
      startDate: string,
      endDate: string,
    ): Promise<TimeEntry[]>;
    postTimeEntry(
      calculationPositionId: number,
      date: string,
      hours: number,
      description: string,
    ): Promise<unknown>;
    updateTimeEntry(
      calculationPositionId: number,
      date: string,
      hours: number,
      description: string,
      billingId: number,
    ): Promise<unknown>;
    deleteTimeEntry(id: number): Promise<unknown>;
    deleteTimeEntryViaServerSideProxy(id: number): Promise<unknown>;
    makeRequest(
      options: RequestInit & {
        url: string;
        params?: string | Record<string, string> | URLSearchParams | string[][];
        predicate?: (response: unknown) => boolean;
      },
    ): Promise<unknown>;
    getCalendarEvents(
      startDate: string,
      endDate: string,
      type?: CalendarEventType | "",
    ): Promise<CalendarEvent[]>;
  }
}
