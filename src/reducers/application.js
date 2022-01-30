export const SET_DAY = "SET_DAY";
export const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
export const SET_INTERVIEW = "SET_INTERVIEW";

export default function reducer(state, action) {
	switch (action.type) {
		case SET_DAY:
			return {
				...state,
				day: action.day,
			};
		case SET_APPLICATION_DATA:
			return {
				...state,
				days: action.days,
				appointments: action.appointments,
				interviewers: action.interviewers,
			};
		case SET_INTERVIEW: {
			// create a new appointment object by copying existing appointment to make sure that the object is not shared
			const appointment = {
				...state.appointments[action.id],
				interview: action.interview,
			};
			// update the appointments object with immutable pattern
			const appointments = {
				...state.appointments,
				[action.id]: appointment,
			};
			// update spots and get new days
			const days = updateSpots(state, appointments);

			return { ...state, appointments, days };
		}
		default:
			throw new Error(
				`Tried to reduce with unsupported action type: ${action.type}`
			);
	}
}

// receives updated/new appointments to calculate spots remaining (instead of relying on outdated state)
function updateSpots(state, appointments) {
	// 0. create new days array to update spots
	// const newDays = [...state.days]; // problem: shallow copy only because multi-dimensional array
	const newDays = Array.from(state.days); // deep clone
	// 1. get the day object
	const dayObj = newDays.find((day) => day.name === state.day);
	// 2. count the day's appointments without interviews to determine spots available
	const spots = dayObj.appointments.filter(
		(appId) => appointments[appId].interview === null
	).length;
	// 3. update spots
	dayObj.spots = spots;
	// const newDay = {...dayObj, spots}
	return newDays;
}
