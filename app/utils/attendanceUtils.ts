import type { PersonioAttendance } from "../apis/personio/Personio.types";

export function mergeAttendendancesForDays(dates: Array<PersonioAttendance>) {
  const mergedData = [];
  const attendancesForDates = dates.reduce(
    (acc, date) => {
      const dateKey = date.date;
      if (acc[dateKey]) {
        acc[dateKey].push(date);
      } else {
        acc[dateKey] = [date];
      }
      return acc;
    },
    {} as Record<string, PersonioAttendance[]>,
  );

  for (let date in attendancesForDates) {
    let totalDuration = 0;
    const sortedData = attendancesForDates[date].sort((a, b) => {
      return (
        +new Date(`1970-01-01T${a.startTime}:00`) -
        +new Date(`1970-01-01T${b.startTime}:00`)
      );
    });
    sortedData.forEach((slot) => {
      const start = new Date(`1970-01-01T${slot.startTime}:00`);
      const end = new Date(`1970-01-01T${slot.endTime}:00`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60); // duration in minutes
      totalDuration += duration - slot.breakTime; // subtract breakTime
    });
    const startOfDay = new Date(
      `1970-01-01T${attendancesForDates[date][0].startTime}:00`,
    );
    const endOfDay = new Date(
      `1970-01-01T${attendancesForDates[date][attendancesForDates[date].length - 1].endTime}:00`,
    );
    const totalDayDuration =
      (endOfDay.getTime() - startOfDay.getTime()) / (1000 * 60);
    const breakTime = totalDayDuration - totalDuration;
    mergedData.push({
      id: attendancesForDates[date][0].id,
      date: attendancesForDates[date][0].date,
      startTime: `${attendancesForDates[date][0].startTime}`,
      endTime: `${attendancesForDates[date][attendancesForDates[date].length - 1].endTime}`,
      breakTime: breakTime,
      ids: attendancesForDates[date].map((slot) => slot.id),
      comment: `Merged ${attendancesForDates[date].length} attendances`,
    });
  }
  return mergedData;
}
