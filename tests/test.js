import { expect, test } from "@playwright/test";
import md5 from "crypto-js/md5.js";

class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async logIn(username, password) {
    await this.page.goto("/");
    await this.page.locator("#username").fill(username);
    await this.page.locator("#password").fill(password);
    await this.page.locator("text=Sign in").click();
  }
}

const correctUser = "user.name";
const correctPassword = "s3cr3t";
const correctAuthnHeader = `Basic ${btoa(
  `${correctUser}:${md5(correctPassword)}`
)}`;

const clientMock = {
  Name: "DigitalService4Germany GmbH",
  Id: 123,
};

const employeeMock = {
  Id: 456,
};

const calculationPositionMock = {
  DisplayPath: "My Project",
  Id: 789,
};

let entries = [];

const apiResponse = (object) => {
  return {
    body: JSON.stringify(object),
    headers: { "Access-Control-Allow-Origin": "*" },
  };
};

test.beforeEach(async ({ context }) => {
  await context.route(
    "https://digitalservice.troi.software/api/v2/rest/**",
    async (route) => {
      const { pathname, searchParams: params } = new URL(route.request().url());
      const method = route.request().method();
      const authnHeader = await route.request().headerValue("Authorization");
      if (authnHeader !== correctAuthnHeader) {
        route.fulfill({
          status: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      } else if (method === "GET" && pathname.endsWith("/clients")) {
        route.fulfill(apiResponse([clientMock]));
      } else if (
        method === "GET" &&
        pathname.endsWith("/employees") &&
        params.get("clientId") === clientMock.Id.toString() &&
        params.get("employeeLoginName") === correctUser
      ) {
        route.fulfill(apiResponse([employeeMock]));
      } else if (
        method === "GET" &&
        pathname.endsWith("/calculationPositions") &&
        params.get("clientId") === clientMock.Id.toString() &&
        params.get("favoritesOnly") === "true"
      ) {
        route.fulfill(apiResponse([calculationPositionMock]));
      } else if (
        method === "GET" &&
        pathname.endsWith("/billings/hours") &&
        params.get("clientId") === clientMock.Id.toString() &&
        params.get("employeeId") === employeeMock.Id.toString() &&
        params.get("calculationPositionId") ===
          calculationPositionMock.Id.toString()
      ) {
        route.fulfill(apiResponse(entries));
      } else if (method === "POST" && pathname.endsWith("/billings/hours")) {
        entries.push({
          id: 1,
          Date: route.request().postDataJSON().Date,
          Quantity: route.request().postDataJSON().Quantity,
          Remark: route.request().postDataJSON().Remark,
        });
        route.fulfill(apiResponse({}));
      } else {
        route.abort();
      }
    }
  );

  await context.route("/time_entries/*", async (route) => {
    const { pathname } = new URL(route.request().url());
    const method = route.request().method();

    const id = parseInt(pathname.split("/").at(-1));

    if (method === "DELETE") {
      entries = entries.filter((entry) => entry.id !== id);
      route.fulfill(apiResponse({}));
    } else {
      route.continue();
    }
  });
});

test.describe("Auth", async () => {
  test("failed log in", async ({ page }) => {
    await new LoginPage(page).logIn(correctUser, "wrong password");

    expect(await page.textContent("p")).toContain("Login failed");
  });

  test("log in and back out", async ({ page }) => {
    await new LoginPage(page).logIn(correctUser, correctPassword);
    expect(await page.textContent("nav div")).toContain(
      "Logged in as user.name"
    );

    await page.locator("text=Log out").click();
    expect(await page.textContent("h2")).toBe("Enter. Time.");
  });
});

test.describe("Time entries", async () => {
  test("add entry", async ({ page }) => {
    await new LoginPage(page).logIn(correctUser, correctPassword);

    await page.locator('[placeholder="2022-01-01"]').click();
    await page.locator("select").first().selectOption("0");
    await page.locator("select").nth(2).selectOption("2022");
    await page.locator('span >> text="17"').click();
    await page.locator('[placeholder="2:15"]').fill("4:45");
    await page.locator('[placeholder="Working the work…"]').fill("a task");
    await page.locator("text=Add").click();

    await expect(page.locator("tr")).toHaveCount(3);

    const firstRow = page.locator("tr >> nth=1");
    await expect(firstRow.locator("td >> nth=0")).toHaveText("2022-01-17");
    await expect(firstRow.locator("td >> nth=1")).toHaveText("4:45");
    await expect(firstRow.locator("td >> nth=2")).toHaveText("a task");

    const newEntryRow = page.locator("tr >> nth=-1");
    await expect(newEntryRow.locator("td >> nth=0")).toBeEmpty();
    await expect(newEntryRow.locator("td >> nth=1")).toBeEmpty();
    await expect(newEntryRow.locator("td >> nth=2")).toBeEmpty();
  });

  test("delete entry", async ({ page }) => {
    await new LoginPage(page).logIn(correctUser, correctPassword);

    entries.push({
      id: 1,
      Date: "2022-01-22",
      Quantity: 1.25,
      Remark: "delete me",
    });

    await page.click('text="Delete"');

    await expect(page.locator("tr")).toHaveCount(2);
    await expect(page.locator("table")).not.toContainText("delete me");
  });
});
