import React, { useRef } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";

function Goal() {
  const { dailyCount, dailyGoal, resetDailyCount } = usePomodoroStore();
  const hasReached = useRef(false);
  const GOALdone = useRef(new Audio("./sounds/GOALdone2.mp3"));

  // Check if goal is reached
  if (dailyCount >= dailyGoal && !hasReached.current) {
    GOALdone.current.play();
    hasReached.current = true;
  }

  return (
    <div className="Goal">
      <p className="GoalText">
        {dailyCount}/{dailyGoal}
      </p>
      <div className="controls">
        <button
          onClick={resetDailyCount}
          className="reset-button btn btn-primary"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default Goal;
