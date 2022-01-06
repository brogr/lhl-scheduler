import React from "react";

import "components/Button.scss";

export default function Button(props) {
	
  let buttonClass = "button";
  // conditional classes
  if (props.confirm) {
    buttonClass += " button--confirm";
  } else if (props.danger) {
    buttonClass += " button--danger";
  }

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}
