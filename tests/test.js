import { expect, test } from "@playwright/test";
import md5 from "crypto-js/md5.js";

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
  Name: "My Project",
  Id: 789,
};

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
      const authnHeader = await route.request().headerValue("Authorization");
      if (authnHeader !== correctAuthnHeader) {
        route.fulfill({
          status: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      } else if (pathname.endsWith("/clients")) {
        route.fulfill(apiResponse([clientMock]));
      } else if (
        pathname.endsWith("/employees") &&
        params.get("clientId") === clientMock.Id.toString() &&
        params.get("employeeLoginName") === correctUser
      ) {
        route.fulfill(apiResponse([employeeMock]));
      } else if (
        pathname.endsWith("/calculationPositions") &&
        params.get("clientId") === clientMock.Id.toString() &&
        params.get("favoritesOnly") === "true"
      ) {
        route.fulfill(apiResponse([calculationPositionMock]));
      } else {
        route.abort();
      }
    }
  );
});

test.describe("Auth", async () => {
  test("failed log in", async ({ page }) => {
    await page.goto("/");
    await page.locator("#username").fill(correctUser);
    await page.locator("#password").fill("wrong password");
    await page.locator("text=Sign in").click();
    expect(await page.textContent("p")).toContain("Login failed");
  });

  test("log in and back out", async ({ page }) => {
    await page.goto("/");
    await page.locator("#username").fill(correctUser);
    await page.locator("#password").fill(correctPassword);
    await page.locator("text=Sign in").click();
    expect(await page.textContent("nav div")).toContain(
      "Logged in as user.name"
    );
    await page.locator("text=Log out").click();
    expect(await page.textContent("h2")).toBe("Enter. Time.");
  });
});
