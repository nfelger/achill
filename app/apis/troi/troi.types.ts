export type CalculationPosition = {
  name: string;
  id: number;
  subprojectId: number;
};

export type TroiProjectTime = {
  id: number;
  date: string;
  hours: number;
  description: string;
  calculationPosition: number;
};

export type TroiProjectTimesById = { [key: number]: TroiProjectTime };
