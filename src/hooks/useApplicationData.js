import { useEffect, useReducer } from "react";
import axios from "axios";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";

function reducer(state, action) {
	switch (action.type) {
		case SET_DAY:
			return {
        ...state,
        day: action.day
			};
		case SET_APPLICATION_DATA:
			return {
				...state,
				days: action.days,
				appointments: action.appointments,
				interviewers: action.interviewers
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
  // console.log(spots);
  // 3. update spots
  dayObj.spots = spots;
  // const newDay = {...dayObj, spots}
  return newDays;
}


function useApplicationData() {
	// url for appointments api
	const API_APPOINTMENTS_URL = "/api/appointments/";

	// reducer (instead of complex useState)
	const [state, dispatch] = useReducer(reducer, {
		day: "Monday",
		days: [],
		appointments: {},
		interviewers: {},
	});

	// Aliased actions for combined state
	const setDay = (day) => dispatch({ type: SET_DAY, day });

	// update the local state when we book an interview
	function bookInterview(id, interview) {
		// update DB & state
		return axios
			.put(API_APPOINTMENTS_URL + id, { interview })
			.then((response) => {
				if (response.status === 204) {
					// dispatch to update reducer state
					dispatch({ type: SET_INTERVIEW, id, interview });
				}
			});
	}

	// delete interview
	function cancelInterview(id) {
		// update DB & state
		return axios.delete(API_APPOINTMENTS_URL + id).then((response) => {
			if (response.status === 204) {
				// dispatch to update reducer state
				dispatch({ type: SET_INTERVIEW, id, interview: null });
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
			// dispatch to update reducer state
			dispatch({
				type: SET_APPLICATION_DATA,
				days: days.data,
				appointments: appointments.data,
				interviewers: interviewers.data,
			});
		});
	}, []);

	// effect to synchronize state via WebSocket
  useEffect(() => {
    // open connection
    const webSocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    // send
    webSocket.onopen = function (event) {
			// webSocket.send("ping");
    };
    
    // receive
    webSocket.onmessage = function (event) {
      // console.log("Message Received:", event.data);
      const message = JSON.parse(event.data);
      
      // eslint-disable-next-line default-case
      switch (message.type) {
        case SET_INTERVIEW: {
          // console.log(SET_INTERVIEW);
          // dispatch to update reducer state
          dispatch(message);
					break;
				}
			}
		};

    // cleanup: close connection
    return () => {
      webSocket.close();
    }
  }, []);


	return { state, setDay, bookInterview, cancelInterview };
}

export default useApplicationData;
