export type CalculationPosition = {
  name: string;
  id: number;
  subprojectId: number;
};

export type TimeEntry = {
  id: number;
  date: string;
  hours: number;
  description: string;
  calculationPosition: number;
};

export type TimeEntries = { [key: number]: TimeEntry };
