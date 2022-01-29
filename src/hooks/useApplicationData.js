import React, { useState, useEffect } from "react";
import axios from "axios";

function useApplicationData() {
  // url for appointments api
  const API_APPOINTMENTS_URL = "/api/appointments/";

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

  // receives updated/new appointments to calculate spots remaining (instead of relying on outdated state)
  function updateSpots(appointments) {
		// 0. create new days array to update spots
		// const newDays = [...state.days]; // problem: shallow copy only because multi-dimensional array
		const newDays = Array.from(state.days); // deep clone

		// 1. get the day object
		const dayObj = newDays.find((day) => day.name === state.day);
		// 2. count the day's appointments without interviews to determine spots available
		const spots = dayObj.appointments.filter(
			(appId) => appointments[appId].interview === null
		).length;
		// console.log(spots);
		// 3. update spots
		dayObj.spots = spots;
		// const newDay = {...dayObj, spots}

		return newDays;
  }
  
  // handle state updates after API calls (update/delete)
  function processAPIResponse(response, appointments) {
		if (response.status === 204) {
			// update spots and get new days
			const days = updateSpots(appointments);
			// update state: setState with the new state object
			setState({ ...state, appointments, days });
		}
	}

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
			.put(API_APPOINTMENTS_URL + id, { interview })
			.then((response) => {
				processAPIResponse(response, appointments);
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
		return axios.delete(API_APPOINTMENTS_URL + id).then((response) => {
			processAPIResponse(response, appointments);
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
