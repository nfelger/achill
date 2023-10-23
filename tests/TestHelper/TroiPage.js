import { expect } from "@playwright/test";
import { TimeoutConfig } from "./TestHelper";

export default class TroiPage {
  constructor(page) {
    this.page = page;
  }

  async expectEntryVisible(entry) {
    const entryCard = this.page.locator(
      "data-testid=entryCard-" + entry.projectId
    );
    const enrtyCardContent = entryCard.locator(
      "data-testid=entry-card-content"
    );
    const expectedText = entry.time + " Hour(s) " + entry.description;
    await expect(enrtyCardContent).toHaveText(expectedText, { timeout: 10000 });

    await this._expectAddEntryFormHidden(entry.projectId);
    await this._expectOnlyDeleteAndEditVisible(entry.projectId);
  }

  async expectNoEntryVisible(projectId) {
    await this._expectAddEntryFormVisible(projectId);
    await this._expectOnlyAddVisible(projectId);
  }

  async expectProjectSectionHidden(projectId) {
    await expect(
      this.page.getByTestId(`project-section-${projectId}`)
    ).toBeHidden(TimeoutConfig);
  }

  async _expectAddEntryFormHidden(projectId) {
    await this._expectAddEntryForm(true, projectId);
  }

  async _expectAddEntryFormVisible(projectId) {
    await this._expectAddEntryForm(false, projectId);
  }

  async _expectAddEntryForm(hidden, projectId) {
    const hoursTestId = "hours-" + projectId;
    const descriptionTestId = "description-" + projectId;
    if (hidden) {
      await expect(this.page.getByTestId(hoursTestId)).toBeHidden(
        TimeoutConfig
      );
      await expect(this.page.getByTestId(descriptionTestId)).toBeHidden(
        TimeoutConfig
      );
    } else {
      await expect(this.page.getByTestId(hoursTestId)).toBeVisible(
        TimeoutConfig
      );
      await expect(this.page.getByTestId(descriptionTestId)).toBeVisible(
        TimeoutConfig
      );
    }
  }

  async _expectOnlyDeleteAndEditVisible(projectId) {
    await expect(this.page.getByTestId(`delete-${projectId}`)).toBeVisible(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`edit-${projectId}`)).toBeVisible(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`add-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`cancel-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`save-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
  }

  async _expectOnlyAddVisible(projectId) {
    await expect(this.page.getByTestId(`delete-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`edit-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`add-${projectId}`)).toBeVisible(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`cancel-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`save-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
  }

  async expectOnlyCancelAndSaveVisible(projectId) {
    await expect(this.page.getByTestId(`delete-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`edit-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`add-${projectId}`)).toBeHidden(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`cancel-${projectId}`)).toBeVisible(
      TimeoutConfig
    );
    await expect(this.page.getByTestId(`save-${projectId}`)).toBeVisible(
      TimeoutConfig
    );
  }

  async expectLoading() {
    await expect(this.page.getByTestId("loadingOverlay")).toBeVisible(
      TimeoutConfig
    );
    await expect(this.page.getByTestId("loadingOverlay")).toBeHidden(
      TimeoutConfig
    );
  }

  async clickOnWeekDay(dayIndex) {
    const testId = ["btn-mon", "btn-tue", "btn-wed", "btn-thu", "btn-fri"][
      dayIndex
    ];

    await this.page.getByTestId(testId).click();
  }

  async clickOnPreviousWeek() {
    await this.page.getByTestId("btn-previous-week").click();
  }

  async clickOnNextWeek() {
    await this.page.getByTestId("btn-next-week").click();
  }

  async clickOnToday() {
    await this.page.getByTestId("btn-today").click();
  }

  async expectSelectedDateToBe(dateString) {
    await expect(this.page.getByTestId("date")).toHaveText(dateString);
  }

  async expectHoursOfWeekdayToBe(dayIndex, hours) {
    const testId = [
      "hours-mon",
      "hours-tue",
      "hours-wed",
      "hours-thu",
      "hours-fri",
    ][dayIndex];

    await expect(this.page.getByTestId(testId)).toHaveText(hours);
  }

  async expectEventIconOfWeekdayToBe(dayIndex, iconName) {
    const testId = [
      "event-mon",
      "event-tue",
      "event-wed",
      "event-thu",
      "event-fri",
    ][dayIndex];

    await expect(this.page.getByTestId(testId)).toHaveText(iconName);
  }

  async expectBannerOfEventTypeWithContent(type, content) {
    await expect(this.page.getByTestId(type)).toBeVisible(TimeoutConfig);
    await expect(this.page.getByTestId(type)).toHaveText(content);
  }

  async editEntry(projectId) {
    await this.page.getByTestId(`edit-${projectId}`).click();
  }

  async saveEntry(projectId) {
    await this.page.getByTestId(`save-${projectId}`).click();
  }

  async deleteEntry(projectId) {
    await this.page.getByTestId(`delete-${projectId}`).click();
  }

  async fillForm(entry) {
    const hoursTestId = "hours-" + entry.projectId;
    const descriptionTestId = "description-" + entry.projectId;

    await this.page.getByTestId(hoursTestId).fill(entry.time);
    await this.page.getByTestId(descriptionTestId).fill(entry.description);
  }

  async submitForm(projectId, useEnter = false) {
    const addButtonTestId = "add-" + projectId;

    if (useEnter) {
      await this.page.keyboard.press("Enter");
    } else {
      await this.page.getByTestId(addButtonTestId).click();
    }
  }
}
