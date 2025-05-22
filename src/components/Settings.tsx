import React, { useState, useEffect } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
// Remove the import for the gif since daily goal is being removed
// import gif102401 from "../assets/000102401.gif";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const {
    workDuration,
    setWorkDuration,
    shortBreakDuration,
    setShortBreakDuration,
    // Remove dailyGoal and setDailyGoal from destructuring
    // dailyGoal,
    // setDailyGoal,
  } = usePomodoroStore();

  const [workTime, setWorkTime] = useState(workDuration);
  const [shortBreak, setShortBreak] = useState(shortBreakDuration);
  // Remove the state for daily goal
  // const [goal, setGoal] = useState(dailyGoal);

  // Update local state when store values change
  useEffect(() => {
    setWorkTime(workDuration);
    setShortBreak(shortBreakDuration);
    // Remove setting goal state here
    // setGoal(dailyGoal);
  }, [workDuration, shortBreakDuration]); // Remove dailyGoal from dependencies

  const handleSave = () => {
    setWorkDuration(workTime);
    setShortBreakDuration(shortBreak);
    // Remove setting daily goal in store here
    // setDailyGoal(goal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Timer Settings</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="settings-content">
          <div className="setting-item">
            <label>Work Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={workTime}
              onChange={(e) => setWorkTime(Number(e.target.value))}
              className="form-control"
            />
          </div>
          <div className="setting-item">
            <label>Break Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="form-control"
            />
          </div>
          {/* Remove Long Break Duration setting */}
          {/* Remove Daily Goal setting */}
        </div>
        <div className="settings-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
