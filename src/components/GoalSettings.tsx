import React, { useState, useEffect } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";

interface GoalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoalSettings: React.FC<GoalSettingsProps> = ({ isOpen, onClose }) => {
  const { dailyGoal, setDailyGoal } = usePomodoroStore();
  const [goal, setGoal] = useState(dailyGoal);

  useEffect(() => {
    setGoal(dailyGoal);
  }, [dailyGoal]);

  const handleSave = () => {
    setDailyGoal(goal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Daily Goal Settings</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="settings-content">
          <div className="setting-item">
            <label>Daily Goal (pomodoros)</label>
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

export default GoalSettings;
