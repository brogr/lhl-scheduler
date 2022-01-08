import React from "react";
import DayListItem from "components/DayListItem";

export default function DayList(props) {
  // map over the days array to return three <DayListItem /> components as children
  const DayListItems = props.days.map(day => {
    return (
      <DayListItem
        key={day.id}
        name={day.name}
        spots={day.spots}
        selected={day.name === props.day}
        setDay={props.setDay}
      />
    );
  });

  return <ul>{DayListItems}</ul>;
}

