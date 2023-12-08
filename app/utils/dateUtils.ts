import moment from "moment";

// Use this to make the date compareble, regardless of its time and timezone
// see https://stackoverflow.com/a/38050824
export function convertToUTCMidnight(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function utcMidnightDateFromString(dateString: string) {
  return new Date(dateString.split(" ")[0] + "T00:00:00Z");
}

// subtraction also possible
export function addDaysToDate(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000); // 24*60*60*1000
}

export function formatDateToYYYYMMDD(date: Date): string {
  return moment(date).format("YYYYMMDD");
}

export function getDatesBetween(startDate: Date, endDate: Date) {
  var dateArray = [];
  var currentDate = startDate;
  while (currentDate <= endDate) {
    dateArray.push(convertToUTCMidnight(currentDate));
    currentDate = addDaysToDate(currentDate, 1);
  }

  return dateArray;
}

export function datesEqual(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function getWeekDaysFor(date: Date) {
  // calc Monday of current week
  const dateDayNumber = date.getDay() || 7; // get current day number, converting Sunday to 7
  var monday = new Date(date);
  if (dateDayNumber !== 1) monday.setHours(-24 * (dateDayNumber - 1)); // only manipulate the date if it isn't Monday

  // assign Monday to Friday based on Monday
  let weekDates = [];
  weekDates[0] = monday;
  for (let i = 1; i < 5; i++) {
    weekDates[i] = addDaysToDate(monday, i);
  }
  // if hours set to 0, summer and winter time will interfere and change the day. Setting to 5 is somewhat "safe"
  weekDates.forEach((date) => date.setHours(5, 0, 0, 0));

  return weekDates;
}

/**
 * ISO-8601 week number
 */
export function getWeekNumberFor(date: Date) {
  var tdt: Date = new Date(date.valueOf());
  var dayn = getDayNumberFor(date);
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - tdt.getTime()) / 604800000);
}

export function getDayNumberFor(date: Date) {
  return (date.getDay() + 6) % 7;
}
