// @ts-nocheck
import TimeEntryCache, {
  convertToCacheFormat,
} from "$lib/stores/TimeEntryCache";
import {
  addDaysToDate,
  formatDateToYYYYMMDD,
  getWeekDaysFor,
} from "$lib/utils/dateUtils";
import { transformCalendarEvent } from "./stores/transformCalendarEvents";

const timeEntryCache = new TimeEntryCache();

const intervallInWeeks = 6;
const intervallInDays = intervallInWeeks * 7;

export default class TroiController {
  async init(troiApi, willStartLoadingCallback, finishedLoadingCallback) {
    this._troiApi = troiApi;
    this._startLoadingCallback = willStartLoadingCallback;
    this._stopLoadingCallback = finishedLoadingCallback;

    const currentWeek = getWeekDaysFor(new Date());
    this._cacheBottomBorder = addDaysToDate(currentWeek[0], -intervallInDays);
    this._cacheTopBorder = addDaysToDate(currentWeek[4], intervallInDays);

    this._projects = await this._troiApi
      .makeRequest({
        url: "/calculationPositions",
        params: {
          clientId: this._troiApi.getClientId(),
          favoritesOnly: true,
        },
      })
      .then((response) =>
        response.map((obj) => {
          return {
            name: obj.DisplayPath,
            id: obj.Id,
            subproject: obj.Subproject.id,
          };
        })
      );

    await this._loadEntriesAndEventsBetween(
      this._cacheBottomBorder,
      this._cacheTopBorder
    );
  }

  // --------- private functions ---------

  // TODO: remove
  // quick fix when clientId or employeeId is undefined
  _verifyTroiApiCredentials() {
    if (
      this._troiApi.clientId == undefined ||
      this._troiApi.employeeId == undefined
    ) {
      console.log(
        "clientId:",
        this._troiApi.clientId,
        "employeeId:",
        this._troiApi.employeeId
      );
      alert("An error in Troi occured, please reload track-your-time!");
      return false;
    }
    return true;
  }

  async _loadEntriesBetween(startDate, endDate) {
    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }

    for (const project of this._projects) {
      console.log(
        "employeeId",
        this._troiApi.employeeId,
        "projectId",
        project.id
      );
      const entries = await this._troiApi.getTimeEntries(
        project.id,
        formatDateToYYYYMMDD(startDate),
        formatDateToYYYYMMDD(endDate)
      );

      timeEntryCache.addEntries(project, entries);
    }
  }

  async _loadCalendarEventsBetween(startDate, endDate) {
    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }
    const calendarEvents = await this._troiApi.getCalendarEvents(
      formatDateToYYYYMMDD(startDate),
      formatDateToYYYYMMDD(endDate)
    );

    calendarEvents.forEach((calendarEvent) => {
      const transformedEvents = transformCalendarEvent(
        calendarEvent,
        startDate,
        endDate
      );
      transformedEvents.forEach((event) => {
        timeEntryCache.addEvent(event);
      });
    });
  }

  async _loadEntriesAndEventsBetween(startDate, endDate) {
    // might be quick fix for not loading time entries if employeeId is undefined
    if (this._troiApi.employeeId == undefined) {
      return;
    }

    await this._loadEntriesBetween(startDate, endDate);
    await this._loadCalendarEventsBetween(startDate, endDate);

    this._cacheBottomBorder = new Date(
      Math.min(new Date(this._cacheBottomBorder), startDate)
    );
    this._cacheTopBorder = new Date(
      Math.max(new Date(this._cacheTopBorder), endDate)
    );
  }

  // -------------------------------------

  getProjects() {
    return this._projects;
  }

  getTimesAndEventsFor(week) {
    let timesAndEventsOfWeek = [];

    week.forEach((date) => {
      timesAndEventsOfWeek.push({
        hours: timeEntryCache.totalHoursOf(date),
        events: timeEntryCache.getEventsFor(date),
      });
    });

    return timesAndEventsOfWeek;
  }

  getEventsFor(date) {
    return timeEntryCache.getEventsFor(date);
  }

  // CRUD Functions for entries

  // CRUD Functions for entries

  async getEntriesFor(date) {
    if (date > this._cacheTopBorder) {
      this._startLoadingCallback();
      const fetchStartDate = getWeekDaysFor(date)[0];
      const fetchEndDate = addDaysToDate(fetchStartDate, intervallInDays - 3);

      await this._loadEntriesAndEventsBetween(fetchStartDate, fetchEndDate);
      this._stopLoadingCallback();
    }

    if (date < this._cacheBottomBorder) {
      this._startLoadingCallback();
      const fetchEndDate = getWeekDaysFor(date)[4];
      const fetchStartDate = addDaysToDate(fetchEndDate, -intervallInDays + 3);

      await this._loadEntriesAndEventsBetween(fetchStartDate, fetchEndDate);
      this._stopLoadingCallback();
    }

    return timeEntryCache.getEntriesFor(date);
  }

  async addEntry(date, project, hours, description, successCallback) {
    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }
    const troiFormattedSelectedDate = convertToCacheFormat(date);
    const result = await this._troiApi.postTimeEntry(
      project.id,
      troiFormattedSelectedDate,
      hours,
      description
    );

    const entry = {
      date: troiFormattedSelectedDate,
      description: result.Name,
      hours: Number(result.Quantity),
      id: result.Id,
    };

    timeEntryCache.addEntry(project, entry, successCallback);
  }

  async deleteEntry(entry, projectId, successCallback) {
    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }
    let result = await this._troiApi.deleteTimeEntryViaServerSideProxy(
      entry.id
    );
    if (result.ok) {
      timeEntryCache.deleteEntry(entry, projectId, successCallback);
    }
  }

  async updateEntry(project, entry, successCallback) {
    // TODO: remove quick fix
    if (!this._verifyTroiApiCredentials) {
      return;
    }
    const result = await this._troiApi.updateTimeEntry(
      project.id,
      entry.date,
      entry.hours,
      entry.description,
      entry.id
    );

    const updatedEntry = {
      date: entry.date,
      description: result.Name,
      hours: Number(result.Quantity),
      id: result.Id,
    };

    timeEntryCache.updateEntry(project, updatedEntry, successCallback);
  }
}
