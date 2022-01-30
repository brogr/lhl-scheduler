import React from "react";
import {
	render,
	cleanup,
	waitForElement,
	fireEvent,
	getByText,
	getAllByTestId,
	getByAltText,
	getByPlaceholderText,
	queryByText,
	queryAllByText,
	prettyDOM,
} from "@testing-library/react";

// For simulating error we need access to axios mock so that we can override its functions
import axios from "axios";
    
import Application from "components/Application";

afterEach(cleanup);

describe("Application", () => {
	xit("defaults to Monday and changes the schedule when a new day is selected (Promise)", () => {
		const { getByText } = render(<Application />);

		return waitForElement(() => getByText("Monday")).then(() => {
			fireEvent.click(getByText("Tuesday"));
			expect(getByText("Leopold Silvers")).toBeInTheDocument();
		});
	});

	it("defaults to Monday and changes the schedule when a new day is selected (Async Await)", async () => {
		const { getByText } = render(<Application />);

		await waitForElement(() => getByText("Monday"));

		fireEvent.click(getByText("Tuesday"));

		expect(getByText("Leopold Silvers")).toBeInTheDocument();
	});

	it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
		const { container, debug } = render(<Application />);

		// wait for data
		await waitForElement(() => getByText(container, "Archie Cohen"));

		// find first appointment
		const appointments = getAllByTestId(container, "appointment");
		const appointment = appointments[0];

		// add appointment and save
		fireEvent.click(getByAltText(appointment, "Add"));
		fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
			target: { value: "Lydia Miller-Jones" },
		});
		fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
		fireEvent.click(getByText(appointment, "Save"));
		// check for "Saving" message / state
		expect(getByText(appointment, "Saving")).toBeInTheDocument();
		// wait after saving, check for student's name
		await waitForElement(() => queryByText(appointment, "Lydia Miller-Jones"));

		// find Monday, check for "no spots remaining"
		const day = getAllByTestId(container, "day").find((day) =>
			queryByText(day, "Monday")
		);
		expect(getByText(day, "no spots remaining")).toBeInTheDocument();

		// debug();
		// console.log(prettyDOM(appointment));
	});

	it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
		const name = "Archie Cohen";

		// 1. Render the Application.
		const { container } = render(<Application />);

		// 2. Wait until the text "Archie Cohen" is displayed.
		await waitForElement(() => getByText(container, name));

		// 3. Find Archie Cohen's appointment, click the "Delete" button.
		const appointment = getAllByTestId(container, "appointment").find(
			(appointment) => queryByText(appointment, name)
		);
		// console.log(prettyDOM(appointment));
		fireEvent.click(getByAltText(appointment, "Delete"));

		// 4. Check that the element with the text "Are you sure you would like to delete?" is displayed.
		expect(
			getByText(appointment, "Are you sure you would like to delete?")
		).toBeInTheDocument();

		// 5. Click the "Confirm" button.
		fireEvent.click(getByText(appointment, "Confirm"));

		// 7. Check that the element with the text "Deleting" is displayed.
		expect(getByText(appointment, "Deleting")).toBeInTheDocument();

		// 8.Wait until the element with empty appointment is displayed
		await waitForElement(() => getByAltText(appointment, "Add"));

		// 9. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
		const day = getAllByTestId(container, "day").find((day) =>
			queryByText(day, "Monday")
		);
		expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
	});

	it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
		const name = "Archie Cohen";
		const newName = "Lydia Miller-Jones";

		// 1. Render the Application.
		const { container } = render(<Application />);

		// 2. Wait until the text "Archie Cohen" is displayed.
		await waitForElement(() => getByText(container, name));

		// 3. Find Archie Cohen's appointment, click the "Edit" button.
		const appointment = getAllByTestId(container, "appointment").find(
			(appointment) => queryByText(appointment, name)
		);
		// console.log(prettyDOM(appointment));
		fireEvent.click(getByAltText(appointment, "Edit"));

		// 4. Change the student name and interviewer
		fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
			target: { value: newName },
		});
		fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

		// 5. Click the "Save" button.
		fireEvent.click(getByText(appointment, "Save"));

		// 7. Check that the element with the text "Saving" is displayed.
		expect(getByText(appointment, "Saving")).toBeInTheDocument();

		// 8.Wait until the element displayed again
		await waitForElement(() => queryByText(appointment, newName));

		// 9. Check that the DayListItem with the text "Monday" also has the text "1 spot remaining".
		const day = getAllByTestId(container, "day").find((day) =>
			queryByText(day, "Monday")
		);
		expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
	});

  it("shows the save error when failing to save an appointment", async () => {
		// For simulating error we need to mock our axios mock
		axios.put.mockRejectedValueOnce();

		const name = "Archie Cohen";
		const newName = "Lydia Miller-Jones";

		// 1. Render the Application.
		const { container } = render(<Application />);

		// 2. Wait until the text "Archie Cohen" is displayed.
		await waitForElement(() => getByText(container, name));

		// 3. Find Archie Cohen's appointment, click the "Edit" button.
		const appointment = getAllByTestId(container, "appointment").find(
			(appointment) => queryByText(appointment, name)
		);
		// console.log(prettyDOM(appointment));
		fireEvent.click(getByAltText(appointment, "Edit"));

		// 4. Change the student name and interviewer
		fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
			target: { value: newName },
		});
		fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

		// 5. Click the "Save" button.
		fireEvent.click(getByText(appointment, "Save"));

		// 6. Check that the element with the text "Saving" is displayed.
		expect(getByText(appointment, "Saving")).toBeInTheDocument();

		// 7. Wait for the Error message
		await waitForElement(() => queryByText(appointment, "Error"));

		// 8. Click the "Close" button.
		fireEvent.click(getByAltText(appointment, "Close"));

		// 9. Wait until the element displayed again with old name
		await waitForElement(() => getByText(appointment, name)).then(() => {
			expect(getByText(appointment, name)).toBeInTheDocument();
		});

		// 10. Check that the DayListItem with the text "Monday" also has the text "1 spot remaining".
		const day = getAllByTestId(container, "day").find((day) =>
			queryByText(day, "Monday")
		);
		expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
	});
  
  it("shows the delete error when failing to delete an existing appointment", async () => {
		// For simulating error we need to mock our axios mock
		axios.delete.mockRejectedValueOnce();

		const name = "Archie Cohen";

		// 1. Render the Application.
		const { container } = render(<Application />);

		// 2. Wait until the text "Archie Cohen" is displayed.
		await waitForElement(() => getByText(container, name));

		// 3. Find Archie Cohen's appointment, click the "Delete" button.
		const appointment = getAllByTestId(container, "appointment").find(
			(appointment) => queryByText(appointment, name)
		);
		// console.log(prettyDOM(appointment));
		fireEvent.click(getByAltText(appointment, "Delete"));

		// 4. Check that the element with the text "Are you sure you would like to delete?" is displayed.
		expect(
			getByText(appointment, "Are you sure you would like to delete?")
		).toBeInTheDocument();

		// 5. Click the "Confirm" button.
		fireEvent.click(getByText(appointment, "Confirm"));

		// 7. Check that the element with the text "Deleting" is displayed.
		expect(getByText(appointment, "Deleting")).toBeInTheDocument();

		// 8. Wait for the Error message
		await waitForElement(() => queryByText(appointment, "Error"));

		// 9. Click the "Close" button.
		fireEvent.click(getByAltText(appointment, "Close"));

		// 10. Wait until the element displayed again with old name
		await waitForElement(() => getByText(appointment, name)).then(() => {
			expect(getByText(appointment, name)).toBeInTheDocument();
		});

		// 11. Check that the DayListItem with the text "Monday" also has the text "1 spot remaining".
		const day = getAllByTestId(container, "day").find((day) =>
			queryByText(day, "Monday")
		);
		expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
	});
  
});