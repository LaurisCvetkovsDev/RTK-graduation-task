import React, { useState } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [duration, setDuration] = useState(50); // Default 50 minutes

  const handleSave = () => {
    // Here we'll update the store with new duration
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
