export type WorkingHours = {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
};

export type PersonioEmployee = {
  id: number;
  workingHours: WorkingHours;
};
