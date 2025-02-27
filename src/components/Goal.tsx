import React, { useState, useEffect } from "react";

const heveToBeDone = 5;

function Goal() {
  const [timerCount, setTimerCount] = useState(
    parseInt(localStorage.getItem("timerCount") || "0") - 1
  );

  useEffect(() => {
    const updateCount = () => {
      setTimerCount(parseInt(localStorage.getItem("timerCount") || "0"));
    };

    const interval = setInterval(updateCount, 1000);

    return () => clearInterval(interval);
  }, []);

  function clearHandler() {
    localStorage.removeItem("timerCount");
    setTimerCount(0); // ✅ Manually update state so UI refreshes
  }

  return (
    <div className="Goal">
      <button onClick={clearHandler} className="reset-button btn btn-primary">
        Clear
      </button>
      <p>
        {timerCount}/{heveToBeDone}
      </p>
    </div>
  );
}

export default Goal;
