import React, { useState, useEffect } from "react";
import axios from "axios";

function useApplicationData() {
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
		return axios
			.put("/api/appointments/" + id, { interview })
			.then((response) => {
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
		return axios.delete("/api/appointments/" + id).then((response) => {
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
  
  return { state, setDay, bookInterview, cancelInterview };
}

export default useApplicationData;
