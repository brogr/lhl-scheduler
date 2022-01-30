import React from "react";

import {
	render,
	cleanup,
	waitForElement,
	fireEvent,
} from "@testing-library/react";

import Application from "components/Application";

afterEach(cleanup);

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
