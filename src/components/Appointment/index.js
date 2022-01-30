import React, { useEffect } from "react";
import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from "./Form";
import Status from "./Status";
import Confirm from "./Confirm";
import Error from "./Error";
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
const ERROR_SAVE = "ERROR_SAVE";
const ERROR_DELETE = "ERROR_DELETE";

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
		props
			.bookInterview(props.id, interview)
			.then(() => transition(SHOW))
			.catch((error) => transition(ERROR_SAVE, true));
	}

	// delete interview
	function cancel() {
		transition(CONFIRM);
	}
	function cancelConfirmed() {
		// transition to deleting before updating
		transition(DELETING, true);
		// cancel interview then transition to empty
		props
			.cancelInterview(props.id)
			.then(() => transition(EMPTY))
			.catch((error) => transition(ERROR_DELETE, true));
	}

	// edit interview
	function edit() {
		transition(EDIT);
	}

	// mode synchronization (for webSockets): transition to the correct mode when the value of interview changes
	useEffect(() => {
		if (mode === EMPTY && props.interview) {
			// interview created
			transition(SHOW);
		} else if ((mode === SHOW && props.interview) === null) {
			// interview deleted
			transition(EMPTY);
		}
	}, [props.interview, transition, mode]);

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
			{mode === SHOW && props.interview && (
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
			{mode === ERROR_DELETE && (
				<Error message="An error occured: delete failed" onClose={back} />
			)}
			{mode === ERROR_SAVE && (
				<Error message="An error occured: save failed" onClose={back} />
			)}
		</article>
	);
}