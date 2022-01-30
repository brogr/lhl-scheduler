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
	prettyDOM,
} from "@testing-library/react";

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
		// wait after saving, check for interviewer's name
		await waitForElement(() => queryByText(appointment, "Lydia Miller-Jones"));

		// find Monday, check for "no spots remaining"
		const day = getAllByTestId(container, "day").find((day) =>
			queryByText(day, "Monday")
		);
		expect(getByText(day, "no spots remaining")).toBeInTheDocument();

		// debug();
		// console.log(prettyDOM(appointment));
	});



});