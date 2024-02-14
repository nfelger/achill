interface Employee {
  type: "Employee";
  attributes: {
    id: {
      value: number;
    };
    work_schedule: {
      value: {
        attributes: {
          monday: string;
          tuesday: string;
          wednesday: string;
          thursday: string;
          friday: string;
          saturday: string;
          sunday: string;
        };
      };
    };
  };
}

export interface PersonioApiEmployees {
  success: true;
  data: Employee[];
}

export interface PersonioApiEmployee {
  success: true;
  data: Employee;
}

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

interface Metadata {
  total_elements: number;
  current_page: number;
  total_pages: number;
}

export interface PersonioAttendancePeriod {
  id: number;
  type: "AttendancePeriod";
  attributes: {
    employee: number;
    date: string;
    start_time: string;
    end_time: string;
    break: number;
    comment: string;
    updated_at: string;
    status: string;
    project?: unknown;
    is_holiday: boolean;
    is_on_time_off: boolean;
  };
}

export interface PersonioApiAttendance {
  success: boolean;
  metadata: Metadata;
  data: PersonioAttendancePeriod[];
  offset: string;
  limit: string;
}

export interface PersonioAttendance {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  breakTime: number;
  comment: string;
}
