import { test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import {
  initializeTestSetup,
  setFixedCurrentDate,
} from "./TestHelper/TestHelper";
import TroiApiStub from "./TestHelper/TroiApiStub";
import { username, password } from "./TestHelper/TroiApiStub";
import TroiPage from "./TestHelper/TroiPage";

let troiPage;

test.beforeEach(async ({ page }) => {
  page.on("console", (msg) => console.log(msg.text()));
  setFixedCurrentDate(page);
  troiPage = new TroiPage(page);
});

test("holiday icon and banner is shown when day is holiday", async ({
  context,
  page,
}) => {
  const calendarEvents = [
    {
      id: "12345",
      Start: "2023-06-07 00:00:00",
      End: "2023-06-07 23:59:59",
      Subject: "Feiertag",
      Type: "H",
    },
  ];

  let mockApi = new TroiApiStub(calendarEvents);
  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const expectedIcon = "wb_sunny";

  await troiPage.expectLoading();
  await troiPage.expectEventIconOfWeekdayToBe(2, expectedIcon);
  await troiPage.expectBannerOfEventTypeWithContent(
    "Holiday",
    `${expectedIcon} Public holiday, working impossible`
  );
});

test("paid vacation icon and half day banner is shown when day is half day paid vacation", async ({
  context,
  page,
}) => {
  const calendarEvents = [
    {
      id: "P1234",
      Start: "2023-06-07 09:00:00",
      End: "2023-06-07 13:00:00",
      Subject: "Bezahlter Urlaub",
      Type: "P",
    },
  ];

  let mockApi = new TroiApiStub(calendarEvents);
  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const expectedIcon = "beach_access";

  await troiPage.expectLoading();
  await troiPage.expectEventIconOfWeekdayToBe(2, expectedIcon);
  await troiPage.expectBannerOfEventTypeWithContent(
    "PaidVacation",
    `${expectedIcon} ½ Day: You are on paid vacation`
  );
});

test("icons and two half day banners are shown for paid vacation and learning when day has half day paid vacation and half day learning", async ({
  context,
  page,
}) => {
  const calendarEvents = [
    {
      id: "P1234",
      Start: "2023-06-07 09:00:00",
      End: "2023-06-07 13:00:00",
      Subject: "Bezahlter Urlaub",
      Type: "P",
    },
    {
      id: "P1234",
      Start: "2023-06-07 14:00:00",
      End: "2023-06-07 18:00:00",
      Subject: "Fortbildung",
      Type: "P",
    },
  ];

  let mockApi = new TroiApiStub(calendarEvents);
  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  let expectedIcon = "beach_access";

  await troiPage.expectLoading();
  await troiPage.expectEventIconOfWeekdayToBe(2, expectedIcon);
  await troiPage.expectBannerOfEventTypeWithContent(
    "PaidVacation",
    `${expectedIcon} ½ Day: You are on paid vacation`
  );

  expectedIcon = "school";
  await troiPage.expectBannerOfEventTypeWithContent(
    "Training",
    `${expectedIcon} ½ Day: Learning`
  );
});
