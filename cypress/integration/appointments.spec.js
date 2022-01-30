/* eslint-disable no-undef */
describe("Appointments", () => {
  beforeEach(() => {
		// reset API DB
		cy.request("GET", "/api/debug/reset");

		// 1. Visits the root of our web server
		cy.visit("/");
		cy.contains("Monday");
	});
  
  it("should book an interview", () => {
		// 2. Clicks on the "Add" button in the second appointment
		cy.get("[alt=Add]").first().click();

		// 3. Enters their name
    cy.get("[data-testid=student-name-input]").type("Lydia Miller-Jones");

		// 4. Chooses an interviewer
    cy.get("[alt='Sylvia Palmer']").click();

		// 5. Clicks the save button
    cy.contains("Save").click();

		// 6. Sees the booked appointment
    cy.contains(".appointment__card--show", "Lydia Miller-Jones");
		cy.contains(".appointment__card--show", "Sylvia Palmer");
  });
  
  it("should edit an interview", () => {
		// 2. Clicks the edit button for the existing appointment
		cy.get("[alt=Edit]").first().click({ force: true });

		// 3. Changes the name and interviewer
		cy.get("[data-testid=student-name-input]").clear().type("Lydia Miller-Jones");
		cy.get("[alt='Tori Malcolm']").click();

		// 5. Clicks the save button
		cy.contains("Save").click();

		// 6. Sees the edit to the appointment
		cy.contains(".appointment__card--show", "Lydia Miller-Jones");
		cy.contains(".appointment__card--show", "Tori Malcolm");
  });
  
  it("should cancel an interview", () => {
		// 2. Clicks the delete button for the existing appointment
		cy.get("[alt=Delete]").first().click({ force: true });

		// 3. Clicks the confirm button
    cy.contains("Confirm").click();
    
    // 4. Checks for Deleting dialogue
    cy.contains("Deleting").should("exist");
		cy.contains("Deleting").should("not.exist");

		// 4. Sees that the appointment slot is empty
		cy.contains(".appointment__card--show", "Archie Cohen").should("not.exist");
	});
});
