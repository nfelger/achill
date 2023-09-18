import moment from "moment";

// cache structure
/* 
  '2023-03-13': {
    projects: {
      254: {
        name: Grundsteuer,
        entries: [
          {id: 14694, date: '2023-03-13', hours: 1},
          {id: 14695, date: '2023-03-13', hours: 2},
          ...
        ]
      },
      255: {
        name: useID, 
        entries: [
          ...
        ]
      }
    },
    sum: 3,
    events : [
      {
        id: '12821',
        subject: 'Karfreitag',
        type: 'H',
        startTime: 09:00:00,
        endTime: 18:00:00
      }
    ]
  },
  ...
*/

const intervallInWeeks = 6;
const intervallInDays = intervallInWeeks * 7;

export default class TimeEntryCache {
  constructor() {
    this.cache = {};
    this.topBorder = intervallInWeeks;
    this.bottomBorder = -intervallInWeeks;
    this.weekIndex = 0;
  }

  // TODO: rework to private property
  getIntervallInDays() {
    return intervallInDays;
  }

  // -----------------------
  // internal cache functions
  _getDay(date) {
    return this.cache[date];
  }

  _entriesFor(date, projectId) {
    return this.cache[date]["projects"][projectId]["entries"];
  }

  _findEntryWithSameDescription(entry, projectId) {
    return this._entriesFor(entry.date, projectId).find(
      (e) => e.description.toLowerCase() == entry.description.toLowerCase()
    );
  }

  _projectsFor(date) {
    date = convertToCacheFormat(date);
    if (date in this.cache) {
      return this._getDay(date)["projects"];
    } else {
      return {};
    }
  }
  // -----------------------

  getEntriesFor(date) {
    const cacheDate = convertToCacheFormat(date);
    let entriesForDate = {};

    if (this.cache[cacheDate] == undefined) {
      return entriesForDate;
    }

    Object.keys(this.cache[cacheDate]["projects"]).forEach((projectId) => {
      entriesForDate[projectId] = this.entriesForProject(date, projectId);
    });

    return entriesForDate;
  }

  getEventsFor(date) {
    const cacheDate = convertToCacheFormat(date);
    if (this.cache[cacheDate] == undefined) {
      return [];
    }

    return this.cache[cacheDate]["events"];
  }

  addEntries(project, entries) {
    entries.forEach((entry) => {
      this.addEntry(project, entry);
    });
  }

  addEntry(position, entry, successCallback = () => {}) {
    // init if not present
    this.initStructureForDateIfNotPresent(entry.date);

    let projects = this._projectsFor(entry.date);
    // init if not present
    if (!(position.id in projects)) {
      this.initStructureForProject(entry.date, position);
    }

    // if description already exists, delete "old entry" bc. troi api adds hours to entry and does not create new one
    const existingEntry = this._findEntryWithSameDescription(entry, position.id);
    if (existingEntry) {
      this.deleteEntry(existingEntry, position.id);
    }

    this._entriesFor(entry.date, position.id).push(entry);
    this._getDay(entry.date).sum += entry.hours;
    successCallback();
  }

  deleteEntry(entry, projectId, successCallback = () => {}) {
    const entries = this._entriesFor(entry.date, projectId);
    const index = entries.map((entry) => entry.id).indexOf(entry.id);

    // If the element is not found, simply return
    if (index == -1) {
      return;
    }
    entries.splice(index, 1);

    this.aggregateHoursFor(entry.date);
    successCallback();
  }

  updateEntry(project, entry, successCallback = () => {}) {
    // if description already exists, delete "old entry" bc. troi api adds hours to entry and does not create new one
    const existingEntry = this._findEntryWithSameDescription(entry, project.id);
    if (existingEntry) {
      this.deleteEntry(existingEntry, project.id);
    }
    this.deleteEntry(entry, project.id);
    this.addEntry(project, entry);
    successCallback();
  }

  addEvent(event) {
    const cacheDate = convertToCacheFormat(event.date);
    this.initStructureForDateIfNotPresent(cacheDate);
    this.cache[cacheDate]["events"].push(event);
  }

  initStructureForDateIfNotPresent(date) {
    if (this.cache[date]) {
      return;
    }

    this.cache[date] = {
      projects: {},
      sum: 0,
      events: [],
    };
  }

  initStructureForProject(date, position) {
    this._projectsFor(date)[position.id] = {
      entries: [],
      name: position.name,
    };
  }

  aggregateHoursFor(date) {
    // get all projectIds
    const projectIds = Object.keys(this._projectsFor(date));

    // iterate entries in each project and aggregate hours
    let sum = 0;
    projectIds.forEach((projectId) => {
      sum += this._entriesFor(date, projectId).reduce((accumulator, entry) => {
        return accumulator + entry.hours;
      }, 0);
    });

    // assign hours
    this.cache[date].sum = sum;
  }

  increaseBottomBorderByIntervall() {
    this.bottomBorder -= intervallInWeeks;
  }

  increaseTopBorderByIntervall() {
    this.topBorder += intervallInWeeks;
  }

  isAtCacheBottom() {
    return this.weekIndex == this.bottomBorder;
  }

  isAtCacheTop() {
    return this.weekIndex == this.topBorder;
  }

  increaseWeekIndex() {
    this.weekIndex++;
  }

  decreaseWeekIndex() {
    this.weekIndex--;
  }

  entriesForProject(date, projectId) {
    const cacheDate = convertToCacheFormat(date);
    if (
      cacheDate in this.cache &&
      projectId in this._getDay(cacheDate)["projects"]
    ) {
      return this._getDay(cacheDate)["projects"][projectId]["entries"];
    } else {
      return [];
    }
  }

  totalHoursOf(date) {
    date = convertToCacheFormat(date);
    if (date in this.cache) {
      return this.cache[date].sum;
    } else {
      return 0;
    }
  }
}

export function convertToCacheFormat(date) {
  return moment(date).format("YYYY-MM-DD");
}
