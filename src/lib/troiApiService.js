import md5 from "crypto-js/md5.js";

export class AuthenticationFailed extends Error {
  constructor() {
    super("Troi Authentication Failed");
    this.name = this.constructor.name;
  }
}

const baseUrl = "https://digitalservice.troi.software/api/v2/rest";

export default class TroiApiService {
  constructor(userName, password) {
    this.userName = userName;
    this.password = password;
    let passwordMd5 = md5(password);
    this.authHeader = {
      Authorization: "Basic " + btoa(`${userName}:${passwordMd5}`),
    };
  }

  async initialize() {
    this.clientId = await this.getClientId();
    this.employeeId = await this.getEmployeeId();
  }

  async getClientId() {
    const client = await this.makeRequest({
      url: "/clients",
      predicate: (obj) => obj.Name === "DigitalService4Germany GmbH",
    });
    return client.Id;
  }

  async getEmployeeId() {
    const employees = await this.makeRequest({
      url: "/employees",
      params: {
        clientId: this.clientId,
        employeeLoginName: this.userName,
      },
    });
    return employees[0].Id;
  }

  async getCalculationPositions() {
    const calculationPositions = await this.makeRequest({
      url: "/calculationPositions",
      params: {
        clientId: this.clientId,
        favoritesOnly: "true",
      },
    });
    return calculationPositions.map((obj) => {
      return {
        name: obj.DisplayPath,
        id: obj.Id,
      };
    });
  }

  async getTimeEntries(calculationPositionId, startDate, endDate) {
    const timeEntries = await this.makeRequest({
      url: "/billings/hours",
      params: {
        clientId: this.clientId,
        employeeId: this.employeeId,
        calculationPositionId: calculationPositionId,
        startDate: startDate,
        endDate: endDate,
      },
    });
    return timeEntries.map((obj) => {
      return {
        id: obj.id,
        date: obj.Date,
        hours: obj.Quantity,
        description: obj.Remark,
      };
    });
  }

  async postTimeEntry(calculationPositionId, date, hours, description) {
    const payload = {
      Client: {
        Path: `/clients/${this.clientId}`,
      },
      CalculationPosition: {
        Path: `/calculationPositions/${calculationPositionId}`,
      },
      Employee: {
        Path: `/employees/${this.employeeId}`,
      },
      Date: date,
      Quantity: hours,
      Remark: description,
    };

    await this.makeRequest({
      url: "/billings/hours",
      headers: { "Content-Type": "application/json" },
      method: "post",
      body: JSON.stringify(payload),
    });
  }

  async deleteTimeEntry(id) {
    await this.makeRequest({
      url: `/billings/hours/${id}`,
      method: "delete",
    });
  }

  async deleteTimeEntryViaServerSideProxy(id) {
    await fetch(`/time_entries/${id}`, {
      method: "delete",
      headers: {
        "X-Troi-Username": this.userName,
        "X-Troi-Password": this.password,
      },
    });
  }

  async makeRequest(options) {
    const defaultOptions = {
      method: "get",
      params: {},
      headers: {},
      body: undefined,
    };
    options = { ...defaultOptions, ...options };
    const { url, method, params, headers, body } = options;

    const response = await fetch(
      `${baseUrl}${url}?${new URLSearchParams(params)}`,
      {
        method: method,
        headers: { ...this.authHeader, ...headers },
        body: body,
      }
    );

    if (response.status === 401) {
      throw new AuthenticationFailed();
    }

    const responseObjects = await response.json();

    if (!("predicate" in options)) {
      return responseObjects;
    }

    for (const responseObject of responseObjects) {
      if (options.predicate(responseObject)) {
        return responseObject;
      }
    }

    throw new Error("predicate provided, but no responseObject fulfills it");
  }
}
