import React from "react";
import { usePomodoroStore } from "../store/pomodoroStore";

const Stats = () => {
  const { totalCount, dailyCount, dailyGoal } = usePomodoroStore();

  // Calculate some basic statistics
  const goalCompletionRate =
    dailyGoal > 0 ? Math.round((dailyCount / dailyGoal) * 100) : 0;

  return (
    <div className="stats">
      <h2 className="mb-4">Your Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card glass-item">
          <h3>Today's Progress</h3>
          <div className="stat-value">
            {dailyCount}/{dailyGoal}
          </div>
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${goalCompletionRate}%` }}
              aria-valuenow={goalCompletionRate}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {goalCompletionRate}%
            </div>
          </div>
        </div>

        <div className="stat-card glass-item">
          <h3>Total Pomodoros</h3>
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Lifetime Achievement</div>
        </div>

        <div className="stat-card glass-item">
          <h3>Average Daily</h3>
          <div className="stat-value">
            {Math.round(totalCount / 7)} {/* Placeholder: assuming 7 days */}
          </div>
          <div className="stat-label">Last 7 Days</div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
