import { useEffect, useReducer } from "react";
import axios from "axios";
import reducer, {
	SET_DAY,
	SET_APPLICATION_DATA,
	SET_INTERVIEW,
} from "reducers/application";

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
