import React, { useRef, useState } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import GoalSettings from "./GoalSettings";

function Goal() {
  const { dailyCount, dailyGoal, resetDailyCount } = usePomodoroStore();
  const hasReached = useRef(false);
  const GOALdone = useRef(new Audio("/pomodoro/sounds/GOALdone2.mp3"));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        <button
          className="settings-button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Goal Settings"
        >
          ⚙️
        </button>
      </div>
      <GoalSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default Goal;
