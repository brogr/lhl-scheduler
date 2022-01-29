import React from "react";
import useApplicationData from "hooks/useApplicationData";
import DayList from "./DayList";
import Appointment from "./Appointment";
import {
	getAppointmentsForDay,
	getInterview,
	getInterviewersForDay,
} from "helpers/selectors";

import "components/Application.scss";

export default function Application(props) {
	// handle applicaiton data
	const { state, setDay, bookInterview, cancelInterview } = useApplicationData();

	// list of interviewers for this day
	const dailyInterviewers = getInterviewersForDay(state, state.day);

	// list of appointments for this day
	const dailyAppointments = getAppointmentsForDay(state, state.day);

	// parse list of appointment
	const AppointmentList = dailyAppointments.map((appointment) => {
		const interview = getInterview(state, appointment.interview);
		return (
			<Appointment
				key={appointment.id}
				{...appointment}
				interview={interview}
				interviewers={dailyInterviewers}
				bookInterview={bookInterview}
				cancelInterview={cancelInterview}
			/>
		);
	});
	AppointmentList.push(<Appointment key="last" time="5pm" />);

	return (
		<main className="layout">
			<section className="sidebar">
				<img
					className="sidebar--centered"
					src="images/logo.png"
					alt="Interview Scheduler"
				/>
				<hr className="sidebar__separator sidebar--centered" />
				<nav className="sidebar__menu">
					<DayList days={state.days} day={state.day} setDay={setDay} />
				</nav>
				<img
					className="sidebar__lhl sidebar--centered"
					src="images/lhl.png"
					alt="Lighthouse Labs"
				/>
			</section>
			<section className="schedule">{AppointmentList}</section>
		</main>
	);
}
