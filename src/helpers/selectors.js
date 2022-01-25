//... returns an array of appointments for that day
export function getAppointmentsForDay(state, day) {
  // validate that days is set
  if (state.days !== undefined || state.days.length > 0) {
    // find day's appointment ids
    const filteredDay = state.days.filter(
      (stateDay) => stateDay.name === day
    );
    // validate that a day was found
    if (filteredDay.length === 1) {
      const appointmentIds = filteredDay[0].appointments;
      // console.log("appointmentIds", appointmentIds);
      // find appointments matching ids we found
      const dayAppointments = appointmentIds.map((id) => state.appointments[id]);
      // console.log("dayAppointments", dayAppointments);
      return dayAppointments;
    }
  }
  // fallback: return empty array 
  return [];
}
