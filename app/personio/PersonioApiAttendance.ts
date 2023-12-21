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
