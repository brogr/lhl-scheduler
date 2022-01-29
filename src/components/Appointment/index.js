import React from "react";
import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from "./Form";
import Status from "./Status";
import Confirm from "./Confirm";
import useVisualMode from "hooks/useVisualMode";

import "components/Appointment/styles.scss";

// mode constants
const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const SAVING = "SAVING";
const DELETING = "DELETING";
const CONFIRM = "CONFIRM";
const EDIT = "EDIT";

export default function Appointment(props) {
  // history handling
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );

  // create interview
  function save(name, interviewer) {
		const interview = {
			student: name,
			interviewer,
    };
    // transition to saving before updating
    transition(SAVING);
    // save interview then transition to show
    props.bookInterview(props.id, interview).then((response) => { transition(SHOW) });  // TODO: Check for error?
  }
  
  // delete interview
  function cancel() {
		transition(CONFIRM);
  }
  function cancelConfirmed() {
		// transition to deleting before updating
		transition(DELETING);
		// cancel interview then transition to empty
		props.cancelInterview(props.id).then((response) => {
			transition(EMPTY);
		}); // TODO: Check for error?
  }
  
  // edit interview
  function edit() {
    transition(EDIT);
  }


  return (
		<article className="appointment">
			<Header time={props.time} />
			{mode === EMPTY && <Empty onAdd={() => transition(CREATE)} />}
			{mode === CONFIRM && (
				<Confirm
					message="Are you sure you would like to delete?"
					onCancel={back}
					onConfirm={cancelConfirmed}
				/>
			)}
			{mode === SAVING && <Status message="Saving" />}
			{mode === DELETING && <Status message="Deleting" />}
			{mode === SHOW && (
				<Show
					student={props.interview.student}
					interviewer={props.interview.interviewer}
          onDelete={cancel}
          onEdit={edit}
				/>
			)}
			{mode === EDIT && (
				<Form
					name={props.interview.student}
					interviewer={props.interview.interviewer.id}
					interviewers={props.interviewers}
					onCancel={back}
					onSave={save}
				/>
			)}
			{mode === CREATE && (
				<Form interviewers={props.interviewers} onCancel={back} onSave={save} />
			)}
		</article>
	);
}