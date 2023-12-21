export interface PersonioApiEmployees {
  success: true;
  data: Employee[];
}

export interface PersonioApiEmployee {
  success: true;
  data: Employee;
}

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
