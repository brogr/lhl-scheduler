import React from "react";
import classNames from "classnames";

import "components/DayListItem.scss"

export default function DayListItem(props) {
  // conditional classes
  const dayClass = classNames({
    "day-list__item": true,
    "day-list__item--selected": props.selected,
    "day-list__item--full": props.spots === 0,
  });

  // format spots string
  const formatSpots = function (spots) {
    let spotsRemaining = `${spots} spots remaining`;
    // eslint-disable-next-line default-case
    switch (spots) {
      case 0:
        spotsRemaining = `no spots remaining`;
        break;
      case 1:
        spotsRemaining = `${spots} spot remaining`;
        break;
    }
    return spotsRemaining;
  };

  return (
		<li
			onClick={() => props.setDay(props.name)}
			className={dayClass}
			data-testid="day"
		>
			<h2 className="text--regular">{props.name}</h2>
			<h3 className="text--light">{formatSpots(props.spots)}</h3>
		</li>
	);
}
