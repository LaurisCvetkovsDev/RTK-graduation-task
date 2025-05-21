import React, { useState, useEffect } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import gif102401 from "../assets/000102401.gif";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { timerDuration, setTimerDuration, dailyGoal, setDailyGoal } =
    usePomodoroStore();
  const [duration, setDuration] = useState(timerDuration);
  const [goal, setGoal] = useState(dailyGoal);

  // Update local state when store values change
  useEffect(() => {
    setDuration(timerDuration);
    setGoal(dailyGoal);
  }, [timerDuration, dailyGoal]);

  const handleSave = () => {
    setTimerDuration(duration);
    setDailyGoal(goal);
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
            <label>Timer Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="form-control"
            />
          </div>
          <div className="setting-item">
            <label>
              Daily Goal (
              <img
                src={gif102401}
                alt="gif"
                style={{ height: "20px", width: "auto" }}
              />
              )
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="form-control"
            />
          </div>
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
