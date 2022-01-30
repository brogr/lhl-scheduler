import React from "react";
import PropTypes from "prop-types";
import InterviewerListItem from "./InterviewerListItem";

import "components/InterviewerList.scss";
  
export default function InterviewerList(props) {
  // map over the interviewers array to return three <InterviewerListItem /> components as children
  const InterviewerListItems = props.interviewers.map((interviewer) => {
    return (
      <InterviewerListItem
        key={interviewer.id}
        name={interviewer.name}
        avatar={interviewer.avatar}
        selected={interviewer.id === props.value}
        setInterviewer={(event) => props.onChange(interviewer.id)}
      />
    );
  });

  return (
    <section className="interviewers">
      <h4 className="interviewers__header text--light">Interviewer</h4>
      <ul className="interviewers__list">{InterviewerListItems}</ul>
    </section>
  );
}

InterviewerList.propTypes = {
	interviewers: PropTypes.array.isRequired,
};
