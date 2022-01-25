import { useState } from "react";

function useVisualMode(initial) {
  // set state to default mode
  const [mode, setMode] = useState(initial);
  // state to keep track of modes' history in array
  const [history, setHistory] = useState([initial]);

  // push: transition to new mode
  const transition = function (newMode, replace = false) {
    if (replace) {
      const newHistory = [...history]; // immutable array pop...
      if (newHistory.length > 1) {
        const prevMode = newHistory.pop();
        setHistory(newHistory);
        setMode(newHistory[newHistory.length - 1]);
      }
    } 
    setMode(newMode);
    setHistory((prev) => [...prev, newMode]); // immutable array push
  };

  // pop: back to previous mode
  const back = function () {
    // setHistory(prev => prev.slice(0, prev.length - 1));
    // setMode(history.slice(0, history.length - 1));
    const newHistory = [...history]; // immutable array pop...
    if (newHistory.length > 1) {
      const prevMode = newHistory.pop();
      setHistory(newHistory);
      setMode(newHistory[newHistory.length - 1]);
    }
  };

  return { mode, transition, back };
}

export default useVisualMode;