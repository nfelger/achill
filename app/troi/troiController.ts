import TimeEntryCache, { convertToCacheFormat } from "../utils/TimeEntryCache";
import {
  addDaysToDate,
  formatDateToYYYYMMDD,
  getWeekDaysFor,
} from "../utils/dateUtils";
import type { TransformedCalendarEvent } from "../utils/transformCalendarEvents";
import { transformCalendarEvent } from "../utils/transformCalendarEvents";
import type { TimeEntry } from "troi-library";
import type TroiApiService from "troi-library";

const timeEntryCache = new TimeEntryCache();

const intervallInWeeks = 6;
const intervallInDays = intervallInWeeks * 7;

export type Project = {
  name: string;
  id: number;
  subproject: number;
};

class TroiApiNotInitializedError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message ?? "TroiAPI not initialized", options);
  }
}

export default class TroiController {
  private _troiApi?: TroiApiService;
  private _startLoadingCallback?: () => unknown;
  private _stopLoadingCallback?: () => unknown;
  private currentWeek = getWeekDaysFor(new Date());
  private _cacheBottomBorder: Date = addDaysToDate(
    this.currentWeek[0],
    -intervallInDays,
  );
  private _cacheTopBorder: Date = addDaysToDate(
    this.currentWeek[4],
    intervallInDays,
  );
  private _projects?: Project[];

  async init(
    troiApi: TroiApiService,
    willStartLoadingCallback: () => unknown,
    finishedLoadingCallback: () => unknown,
  ) {
    this._troiApi = troiApi;
    this._startLoadingCallback = willStartLoadingCallback;
    this._stopLoadingCallback = finishedLoadingCallback;

    await this._troiApi.initialize();

    this._projects = await this._troiApi
      .makeRequest({
        url: "/calculationPositions",
        params: {
          clientId: (await this._troiApi.getClientId()).toString(),
          favoritesOnly: true.toString(),
        },
      })
      .then((response) =>
        (response as any).map((obj: unknown) => {
          return {
            name: (obj as any).DisplayPath,
            id: (obj as any).Id,
            subproject: (obj as any).Subproject.id,
          };
        }),
      );

    await this._loadEntriesAndEventsBetween(
      this._cacheBottomBorder,
      this._cacheTopBorder,
    );
  }

  // --------- private functions ---------

  // TODO: remove
  // quick fix when clientId or employeeId is undefined
  _verifyTroiApiCredentials() {
    if (this._troiApi === undefined) {
      throw new TroiApiNotInitializedError();
    }

    if (
      this._troiApi.clientId == undefined ||
      this._troiApi.employeeId == undefined
    ) {
      console.log(
        "clientId:",
        this._troiApi?.clientId,
        "employeeId:",
        this._troiApi?.employeeId,
      );
      alert("An error in Troi occured, please reload track-your-time!");
      return false;
    }
    return true;
  }

  async _loadEntriesBetween(startDate: Date, endDate: Date) {
    if (this._troiApi === undefined) {
      throw new TroiApiNotInitializedError();
    }

    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }

    await Promise.all(
      this._projects?.map(async (project) => {
        if (this._troiApi === undefined) {
          throw new TroiApiNotInitializedError();
        }
        console.log(
          "employeeId",
          this._troiApi.employeeId,
          "projectId",
          project.id,
        );
        const entries = await this._troiApi.getTimeEntries(
          project.id,
          formatDateToYYYYMMDD(startDate),
          formatDateToYYYYMMDD(endDate),
        );

        timeEntryCache.addEntries(project, entries);
      }) ?? [],
    );
  }

  async _loadCalendarEventsBetween(startDate: Date, endDate: Date) {
    if (this._troiApi === undefined) {
      throw new TroiApiNotInitializedError();
    }

    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }
    const calendarEvents = await this._troiApi.getCalendarEvents(
      formatDateToYYYYMMDD(startDate),
      formatDateToYYYYMMDD(endDate),
    );

    calendarEvents.forEach((calendarEvent) => {
      const transformedEvents = transformCalendarEvent(
        calendarEvent,
        startDate,
        endDate,
      );
      transformedEvents.forEach((event) => {
        timeEntryCache.addEvent(event);
      });
    });
  }

  async _loadEntriesAndEventsBetween(startDate: Date, endDate: Date) {
    if (this._troiApi === undefined) {
      throw new TroiApiNotInitializedError();
    }

    // might be quick fix for not loading time entries if employeeId is undefined
    if (this._troiApi.employeeId == undefined) {
      return;
    }

    await this._loadEntriesBetween(startDate, endDate);
    await this._loadCalendarEventsBetween(startDate, endDate);

    this._cacheBottomBorder = new Date(
      Math.min(
        new Date(this._cacheBottomBorder).getTime(),
        startDate.getTime(),
      ),
    );
    this._cacheTopBorder = new Date(
      Math.max(new Date(this._cacheTopBorder).getTime(), endDate.getTime()),
    );
  }

  // -------------------------------------

  getProjects() {
    return this._projects;
  }

  getTimesAndEventsFor(week: Date[]) {
    let timesAndEventsOfWeek: {
      hours: number;
      events: TransformedCalendarEvent[];
    }[] = [];

    week.forEach((date) => {
      timesAndEventsOfWeek.push({
        hours: timeEntryCache.totalHoursOf(date),
        events: timeEntryCache.getEventsFor(date),
      });
    });

    return timesAndEventsOfWeek;
  }

  getEventsFor(date: Date) {
    return timeEntryCache.getEventsFor(date);
  }

  // CRUD Functions for entries

  // CRUD Functions for entries

  async getEntriesFor(date: Date) {
    if (date > this._cacheTopBorder) {
      this._startLoadingCallback?.();
      const fetchStartDate = getWeekDaysFor(date)[0];
      const fetchEndDate = addDaysToDate(fetchStartDate, intervallInDays - 3);

      await this._loadEntriesAndEventsBetween(fetchStartDate, fetchEndDate);
      this._stopLoadingCallback?.();
    }

    if (date < this._cacheBottomBorder) {
      this._startLoadingCallback?.();
      const fetchEndDate = getWeekDaysFor(date)[4];
      const fetchStartDate = addDaysToDate(fetchEndDate, -intervallInDays + 3);

      await this._loadEntriesAndEventsBetween(fetchStartDate, fetchEndDate);
      this._stopLoadingCallback?.();
    }

    return timeEntryCache.getEntriesFor(date);
  }

  async addEntry(
    date: Date,
    project: Project,
    hours: number,
    description: string,
    successCallback: () => unknown,
  ) {
    if (this._troiApi === undefined) {
      throw new TroiApiNotInitializedError();
    }
    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }
    this._startLoadingCallback?.();
    const troiFormattedSelectedDate = convertToCacheFormat(date);
    const result = (await this._troiApi.postTimeEntry(
      project.id,
      troiFormattedSelectedDate,
      hours,
      description,
    )) as {
      Name: string;
      Quantity: string;
      Id: number;
    };

    const entry: TimeEntry = {
      date: troiFormattedSelectedDate,
      description: result.Name,
      hours: Number(result.Quantity),
      id: result.Id,
    };

    timeEntryCache.addEntry(project, entry, successCallback);
    this._stopLoadingCallback?.();
  }

  async deleteEntry(
    entry: TimeEntry,
    projectId: number,
    successCallback: () => unknown,
  ) {
    if (this._troiApi === undefined) {
      throw new TroiApiNotInitializedError();
    }
    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }
    this._startLoadingCallback?.();
    let result = (await this._troiApi.deleteTimeEntryViaServerSideProxy(
      entry.id,
    )) as {
      ok: boolean;
    };
    if (result.ok) {
      timeEntryCache.deleteEntry(entry, projectId, successCallback);
    }
    this._stopLoadingCallback?.();
  }

  async updateEntry(
    project: Project,
    entry: TimeEntry,
    successCallback: () => unknown,
  ) {
    if (this._troiApi === undefined) {
      throw new TroiApiNotInitializedError();
    }
    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }
    this._startLoadingCallback?.();
    const result = (await this._troiApi.updateTimeEntry(
      project.id,
      entry.date,
      entry.hours,
      entry.description,
      entry.id,
    )) as {
      Name: string;
      Quantity: string;
      Id: number;
    };

    const updatedEntry = {
      date: entry.date,
      description: result.Name,
      hours: Number(result.Quantity),
      id: result.Id,
    };

    timeEntryCache.updateEntry(project, updatedEntry, successCallback);
    this._stopLoadingCallback?.();
  }
}
