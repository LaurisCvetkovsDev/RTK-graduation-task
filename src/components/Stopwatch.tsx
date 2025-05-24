import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import type { PomodoroState } from "../store/pomodoroStore";
import Settings from "./Settings";
import { useAuth } from "../contexts/AuthContext";
import { pomodoroSessionService } from "../services/api";
import { useTimer } from "../contexts/TimerContext";
// import CompactTimer from "./CompactTimer"; // CompactTimer is now controlled by main process
import { useNavigate } from "react-router-dom";

// Remove POMODOROS_UNTIL_LONG_BREAK as long breaks are removed
// const POMODOROS_UNTIL_LONG_BREAK = 4;

// Add type definitions for electronAPI
declare global {
  interface Window {
    electronAPI?: {
      minimizeTimer: () => void;
      startTimer: () => void;
      pauseTimer: () => void;
      onRestore: (callback: () => void) => void;
      sendTimerUpdate: (timeLeft: number, isRunning: boolean) => void;
    };
  }
}

function CountdownTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const {
    workDuration,
    shortBreakDuration,
    // Remove longBreakDuration as it's no longer in the store
    // longBreakDuration,
    isWorkPhase,
    togglePhase,
    incrementCount,
    setCompleted,
  } = usePomodoroStore();

  // Initialize timeLeft based on work duration
  // const [timeLeft, setTimeLeft] = useState(workDuration * 60 * 1000);
  const timeLeftRef = useRef(workDuration * 60 * 1000); // Use useRef for timeLeft
  const [displayTime, setDisplayTime] = useState(workDuration * 60 * 1000); // State for display

  // Remove completedPomodoros state as long breaks are not tracked based on completed cycles
  // const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const intervalIdRef = useRef<number | null>(null);
  const POMODOROdone = useRef(
    new Audio("/pomodoro/sounds/POMODOROdone2-1.mp3")
  );
  const { user } = useAuth();

  // Ref to track if handleTimerEnd has already executed for the current cycle
  const hasTimerEndedRef = useRef(false);

  // State to manage if the main timer view should be hidden
  const [isMainTimerVisible, setIsMainTimerVisible] = useState(true);

  // State to track if Electron API is loaded
  const [isElectronApiLoaded, setIsElectronApiLoaded] = useState(false);

  // Check if we're in compact mode
  const isCompactMode =
    new URLSearchParams(window.location.search).get("compact") === "true";

  // Log state changes for debugging
  useEffect(() => {
    console.log("isMainTimerVisible changed to:", isMainTimerVisible);
  }, [isMainTimerVisible]);

  // Effect to check if Electron API is loaded with polling
  useEffect(() => {
    const checkElectronApi = setInterval(() => {
      if (window.electronAPI) {
        setIsElectronApiLoaded(true);
        console.log("Electron API loaded.");
        clearInterval(checkElectronApi);
      }
    }, 100);

    return () => clearInterval(checkElectronApi);
  }, []);

  // Set initial timeLeft based on the current phase from the store
  // Simplified useEffect as there's only one break duration
  useEffect(() => {
    if (isWorkPhase) {
      // setTimeLeft(workDuration * 60 * 1000);
      timeLeftRef.current = workDuration * 60 * 1000;
      setDisplayTime(timeLeftRef.current);
    } else {
      // setTimeLeft(shortBreakDuration * 60 * 1000);
      timeLeftRef.current = shortBreakDuration * 60 * 1000;
      setDisplayTime(timeLeftRef.current);
    }
  }, [isWorkPhase, workDuration, shortBreakDuration]); // Remove longBreakDuration and completedPomodoros from dependencies

  // Remove the second useEffect that updates timeLeft based on workDuration change (redundant with the first one)
  // useEffect(() => {
  //   if (isWorkPhase) {
  //     setTimeLeft(workDuration * 60 * 1000);
  //   }
  // }, [workDuration, isWorkPhase]);

  const handleTimerEnd = useCallback(async () => {
    // Prevent double execution
    if (hasTimerEndedRef.current) {
      return;
    }
    hasTimerEndedRef.current = true;

    if (isWorkPhase) {
      // Work phase ended

      // ** Save completed session to backend **
      if (user) {
        const endTime = new Date();
        // Use the current workDuration from the store directly
        const currentWorkDuration = usePomodoroStore.getState().workDuration;
        const startTime = new Date(
          endTime.getTime() - currentWorkDuration * 60 * 1000
        ); // Estimate start time

        try {
          await pomodoroSessionService.createSession({
            user_id: user.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration: currentWorkDuration * 60, // Duration in seconds
            is_completed: true, // Mark as completed
          });
          console.log("Pomodoro session saved successfully.");
          // Use the current incrementCount from the store directly
          usePomodoroStore.getState().incrementCount(currentWorkDuration);
          // Set isCompleted to true to trigger Friends component update
          usePomodoroStore.getState().setCompleted(true);
          // Reset isCompleted after a short delay
          setTimeout(() => {
            usePomodoroStore.getState().setCompleted(false);
          }, 1000);
        } catch (error: any) {
          // Explicitly type error
          console.error("Failed to save pomodoro session:", error);
          // Optionally handle error on the UI, but still proceed with phase toggle
          // We still increment frontend count for user feedback even if backend save fails for now
          usePomodoroStore.getState().incrementCount(currentWorkDuration);
        }
      } else {
        console.warn("User not logged in. Cannot save pomodoro session.");
        // Use the current incrementCount from the store directly
        usePomodoroStore
          .getState()
          .incrementCount(usePomodoroStore.getState().workDuration);
      }

      POMODOROdone.current.play();

      // Use the current break duration from the store directly
      const currentShortBreakDuration =
        usePomodoroStore.getState().shortBreakDuration;
      // setTimeLeft(currentShortBreakDuration * 60 * 1000);
      timeLeftRef.current = currentShortBreakDuration * 60 * 1000;
      setDisplayTime(timeLeftRef.current);

      // Use the current togglePhase from the store directly
      usePomodoroStore.getState().togglePhase();
      setIsRunning(false); // Explicitly stop the timer
    } else {
      // Break ended
      // Transition back to work phase with work duration
      // Use the current workDuration from the store directly
      const currentWorkDuration = usePomodoroStore.getState().workDuration;
      // setTimeLeft(currentWorkDuration * 60 * 1000);
      timeLeftRef.current = currentWorkDuration * 60 * 1000;
      setDisplayTime(timeLeftRef.current);

      // Use the current togglePhase from the store directly
      usePomodoroStore.getState().togglePhase();
      setIsRunning(false); // Explicitly stop the timer
    }
  }, [isWorkPhase, user]); // Reduced dependencies

  // Ref to hold the latest handleTimerEnd function
  const handleTimerEndRef = useRef(handleTimerEnd);

  useEffect(() => {
    handleTimerEndRef.current = handleTimerEnd; // Update the ref whenever handleTimerEnd changes
  }, [handleTimerEnd]);

  // Effect to manage the timer interval
  useEffect(() => {
    if (isRunning) {
      intervalIdRef.current = window.setInterval(() => {
        timeLeftRef.current -= 1000;
        setDisplayTime(timeLeftRef.current);

        if (timeLeftRef.current <= 0) {
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null; // Clear the ref immediately
          }
          handleTimerEndRef.current(); // Trigger the end handler via ref
        }
      }, 1000);
    } else {
      // Clear interval if timer is stopped or isRunning becomes false
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    // Cleanup function to clear interval on unmount or when isRunning changes
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isRunning]); // Only re-run if isRunning changes

  // Effect to send timer updates to the main process
  useEffect(() => {
    if (
      isElectronApiLoaded &&
      window.electronAPI && // Correctly check for window.electronAPI
      window.electronAPI.sendTimerUpdate // Correctly check for sendTimerUpdate on window.electronAPI
    ) {
      // Send timeLeft in seconds, not milliseconds
      window.electronAPI.sendTimerUpdate(
        Math.floor(timeLeftRef.current / 1000),
        isRunning
      ); // Use timeLeftRef.current
    }
  }, [timeLeftRef.current, isRunning, isElectronApiLoaded]); // Add timeLeftRef.current to dependencies

  // Set up restore listener
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onRestore(() => {
        setIsMainTimerVisible(true);
      });
    }
  }, []);

  // Send timer updates to compact window
  useEffect(() => {
    if (window.electronAPI && !isMainTimerVisible) {
      window.electronAPI.sendTimerUpdate(timeLeftRef.current, isRunning);
    }
  }, [timeLeftRef.current, isRunning, isMainTimerVisible]);

  function start() {
    console.log(
      "start() function called. Current timeLeft:",
      timeLeftRef.current
    );
    if (timeLeftRef.current > 0) {
      if (isRunning) {
        setIsRunning(false);
        console.log("setIsRunning(false)");
        // Notify main process to pause timer
        if (
          isElectronApiLoaded &&
          window.electronAPI &&
          window.electronAPI.pauseTimer
        ) {
          window.electronAPI.pauseTimer();
        }
      } else {
        setIsRunning(true);
        console.log("setIsRunning(true)");
        // Notify main process to start timer
        if (
          isElectronApiLoaded &&
          window.electronAPI &&
          window.electronAPI.startTimer
        ) {
          window.electronAPI.startTimer();
        }
      }
    }
  }

  function reset() {
    setIsRunning(false);
    setDisplayTime(workDuration * 60 * 1000);
    timeLeftRef.current = workDuration * 60 * 1000;
    // Remove resetTimer IPC call since it's not needed
  }

  // Function to handle minimize button click
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeTimer();
    }
  };

  function formatTime(timeInMs: number) {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  const getPhaseColor = () => {
    if (isWorkPhase) return "#ff6b6b"; // Red for work
    return "#4a90e2"; // Blue for break (no distinction between short/long)
  };

  const getPhaseText = () => {
    if (isWorkPhase) return "Work Time";
    return "Break";
  };

  // Render null if the main timer is not visible and we're not in compact mode
  if (!isMainTimerVisible && !isCompactMode) {
    return null;
  }

  return (
    <>
      <div className={`stopWatch ${isCompactMode ? "compact-mode" : ""}`}>
        <div
          className="phase-indicator"
          style={{
            color: getPhaseColor(),
            marginBottom: "10px",
            fontSize: isCompactMode ? "0.9rem" : "1.2rem",
          }}
        >
          {getPhaseText()}
        </div>
        <div
          className="display"
          style={{ fontSize: isCompactMode ? "1.8rem" : "5rem" }}
        >
          {formatTime(displayTime)}
        </div>
        <div className="controls">
          <button onClick={start} className="start-button btn btn-primary">
            {isRunning ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="6" y="4" width="3" height="12" fill="#111" />
                <rect x="11" y="4" width="3" height="12" fill="#111" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L16 10L7 16V4Z" fill="#111" />
              </svg>
            )}
          </button>
          <button onClick={reset} className="reset-button btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4a6 6 0 1 1-4.24 1.76"
                stroke="#111"
                strokeWidth="2"
                fill="none"
              />
              <polygon points="4,4 8,4 8,8" fill="#111" />
            </svg>
          </button>
          {!isCompactMode && (
            <button
              className="btn btn-outline-light"
              onClick={handleMinimize}
              disabled={!isElectronApiLoaded}
              title={
                !isElectronApiLoaded
                  ? "Loading Electron API..."
                  : "Minimize Timer"
              }
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="5" y="15" width="10" height="2" rx="1" fill="#111" />
              </svg>
            </button>
          )}
        </div>
        {!isCompactMode && (
          <div className="settings-button-container">
            <button
              className="settings-button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Timer Settings"
            >
              ⚙️
            </button>
          </div>
        )}
      </div>
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

export default CountdownTimer;
