import React, { useState, useEffect, useRef } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import type { PomodoroState } from "../store/pomodoroStore";
import Settings from "./Settings";

function CountdownTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const { timerDuration, setTimerDuration } = usePomodoroStore();
  const [elapsedTime, setElapsedTime] = useState(timerDuration * 60 * 1000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const intervalIdRef = useRef<number | null>(null);
  const POMODOROdone = useRef(new Audio("./sounds/POMODOROdone2-1.mp3"));
  const incrementCount = usePomodoroStore(
    (state: PomodoroState) => state.incrementCount
  );
  const initialTimeRef = useRef(timerDuration * 60 * 1000);

  // Update elapsed time when timer duration changes
  useEffect(() => {
    setElapsedTime(timerDuration * 60 * 1000);
    initialTimeRef.current = timerDuration * 60 * 1000;
  }, [timerDuration]);

  const handleTimerEnd = () => {
    if (localStorage.getItem("timerUpdated") === "true") return;
    localStorage.setItem("timerUpdated", "true");

    // Calculate completed minutes
    const completedMinutes = Math.floor(
      (initialTimeRef.current - elapsedTime) / (60 * 1000)
    );
    if (completedMinutes > 0) {
      incrementCount(completedMinutes);
      POMODOROdone.current.play();
    }

    setTimeout(() => {
      localStorage.removeItem("timerUpdated");
    }, 2000);
  };

  useEffect(() => {
    if (isRunning) {
      intervalIdRef.current = window.setInterval(() => {
        setElapsedTime((prev) => {
          if (prev <= 10) {
            clearInterval(intervalIdRef.current!);
            handleTimerEnd();
            return 0;
          }
          return prev - 10;
        });
      }, 10);
    } else {
      clearInterval(intervalIdRef.current!);
      intervalIdRef.current = null;
    }

    return () => clearInterval(intervalIdRef.current!);
  }, [isRunning]);

  function start() {
    if (elapsedTime > 0) {
      setIsRunning(true);
      initialTimeRef.current = elapsedTime;
    }
  }

  function stop() {
    if (isRunning) {
      // Calculate completed minutes when stopping manually
      const completedMinutes = Math.floor(
        (initialTimeRef.current - elapsedTime) / (60 * 1000)
      );
      if (completedMinutes > 0) {
        incrementCount(completedMinutes);
      }
    }
    setIsRunning(false);
  }

  function reset() {
    setElapsedTime(timerDuration * 60 * 1000);
    initialTimeRef.current = timerDuration * 60 * 1000;
    setIsRunning(false);
  }

  function formatTime() {
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor((elapsedTime % 1000) / 10);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}:${String(milliseconds).padStart(2, "0")}`;
  }

  return (
    <>
      <div className="stopWatch">
        <div className="display">{formatTime()}</div>
        <div className="controls">
          <button onClick={start} className="start-button btn btn-primary">
            Start
          </button>
          <button onClick={stop} className="stop-button btn btn-primary">
            Stop
          </button>
          <button onClick={reset} className="reset-button btn btn-primary">
            Reset
          </button>
        </div>
        <div className="settings-button-container">
          <button
            className="settings-button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Timer Settings"
          >
            ⚙️
          </button>
        </div>
      </div>
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

export default CountdownTimer;
