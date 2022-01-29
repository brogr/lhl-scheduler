import React, { useState, useEffect } from "react";
import axios from "axios";
import DayList from "./DayList";
import Appointment from "./Appointment";
import {
  getAppointmentsForDay,
  getInterview,
  getInterviewersForDay,
} from "helpers/selectors";

import "components/Application.scss";

// Test data for DayList
/* const days = [
  {
    id: 1,
    name: "Monday",
    spots: 2,
  },
  {
    id: 2,
    name: "Tuesday",
    spots: 5,
  },
  {
    id: 3,
    name: "Wednesday",
    spots: 0,
  },
]; */
// Test data for Appointment
/* const appointments = [
  {
    id: 1,
    time: "12pm",
  },
  {
    id: 2,
    time: "1pm",
    interview: {
      student: "Lydia Miller-Jones",
      interviewer: {
        id: 1,
        name: "Sylvia Palmer",
        avatar: "https://i.imgur.com/LpaY82x.png",
      },
    },
  },
  {
    id: 3,
    time: "2pm",
    interview: {
      student: "Hans Heiri",
      interviewer: {
        id: 2,
        name: "Tori Malcolm",
        avatar: "https://i.imgur.com/Nmx0Qxo.png",
      },
    },
  },
  {
    id: 4,
    time: "3pm",
    interview: {
      student: "Ann Mitchell",
      interviewer: {
        id: 3,
        name: "Mildred Nazir",
        avatar: "https://i.imgur.com/T2WwVfS.png",
      },
    },
  },
  {
    id: 5,
    time: "4pm",
    interview: {
      student: "Sirah Cypress",
      interviewer: {
        id: 4,
        name: "Cohana Roy",
        avatar: "https://i.imgur.com/FK8V841.jpg",
      },
    },
  },
]; */

export default function Application(props) {
	// combined state
	const [state, setState] = useState({
		day: "Monday",
		days: [],
		appointments: {},
		interviewers: {},
	});

	// Aliased actions for combined state
	const setDay = (day) => setState({ ...state, day });
	// const setDays = (days) => setState((prev) => ({ ...prev, days }));

	// update the local state when we book an interview
	function bookInterview(id, interview) {
		// console.log(id, interview);
		// create a new appointment object by copying existing appointment to make sure that the object is not shared
		const appointment = {
			...state.appointments[id],
			interview: { ...interview },
		};
		// update the appointments object with immutable pattern
		const appointments = {
			...state.appointments,
			[id]: appointment,
		};
		
    // update DB & state
    return axios.put("/api/appointments/" + id, { interview }).then(response => {
      if (response.status === 204) {
				// console.log("saved", response);
				// update state: setState with the new state object
        setState({ ...state, appointments });
			}
    });
  }
  
  // delete interview
  function cancelInterview(id) {
		// create a new appointment object by copying existing appointment to make sure that the object is not shared
		const appointment = {
			...state.appointments[id],
			interview: null,
		};
		// update the appointments object with immutable pattern
		const appointments = {
			...state.appointments,
			[id]: appointment,
		};

		// update DB & state
		return axios
			.delete("/api/appointments/" + id)
			.then((response) => {
				if (response.status === 204) {
					// console.log("saved", response);
					// update state: setState with the new state object
					setState({ ...state, appointments });
				}
			});
	}

	// effect to fetch data from API
	useEffect(() => {
		Promise.all([
			axios.get("/api/days"),
			axios.get("/api/appointments"),
			axios.get("/api/interviewers"),
		]).then((all) => {
			// console.log(all);
			const [days, appointments, interviewers] = all;
			// set combined state at once
			setState((prev) => ({
				...prev,
				days: days.data,
				appointments: appointments.data,
				interviewers: interviewers.data,
			}));
		});
	}, []);

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
