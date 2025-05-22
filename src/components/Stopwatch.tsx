import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import type { PomodoroState } from "../store/pomodoroStore";
import Settings from "./Settings";
import { useAuth } from "../contexts/AuthContext";
import { pomodoroSessionService } from "../services/api";

// Remove POMODOROS_UNTIL_LONG_BREAK as long breaks are removed
// const POMODOROS_UNTIL_LONG_BREAK = 4;

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
  const [timeLeft, setTimeLeft] = useState(workDuration * 60 * 1000);
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

  // Set initial timeLeft based on the current phase from the store
  // Simplified useEffect as there's only one break duration
  useEffect(() => {
    if (isWorkPhase) {
      setTimeLeft(workDuration * 60 * 1000);
    } else {
      setTimeLeft(shortBreakDuration * 60 * 1000);
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
      setTimeLeft(currentShortBreakDuration * 60 * 1000);
      // Use the current togglePhase from the store directly
      usePomodoroStore.getState().togglePhase();
      setIsRunning(false); // Explicitly stop the timer
    } else {
      // Break ended
      // Transition back to work phase with work duration
      // Use the current workDuration from the store directly
      const currentWorkDuration = usePomodoroStore.getState().workDuration;
      setTimeLeft(currentWorkDuration * 60 * 1000);
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

  useEffect(() => {
    if (isRunning) {
      intervalIdRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          // Calculate next time
          const nextTime = prev - 1000;

          // If timer reaches zero or goes below it for the first time in this cycle
          if (nextTime <= 0 && intervalIdRef.current !== null) {
            // Check if interval is still active
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null; // Clear the ref immediately
            handleTimerEndRef.current(); // Trigger the end handler via ref
            return 0; // Set time to exactly 0
          }

          if (nextTime < 0) {
            return 0; // Prevent negative time
          }

          return nextTime; // Continue counting down
        });
      }, 1000);
    } else {
      // Clear interval if timer is stopped manually
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    // Cleanup function to clear interval on unmount or when isRunning changes to false
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isRunning]); // Removed handleTimerEnd from dependencies

  function start() {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }

  function stop() {
    setIsRunning(false);
  }

  function reset() {
    setIsRunning(false);
    setTimeLeft(usePomodoroStore.getState().workDuration * 60 * 1000); // Use store state directly
    // Reset the hasTimerEndedRef when resetting the timer
    hasTimerEndedRef.current = false;
    // Remove resetting completedPomodoros
    // setCompletedPomodoros(0);
  }

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

  return (
    <>
      <div className="stopWatch">
        <div
          className="phase-indicator"
          style={{
            color: getPhaseColor(),
            marginBottom: "10px",
            fontSize: "1.2rem",
          }}
        >
          {getPhaseText()}
        </div>
        <div className="display">{formatTime(timeLeft)}</div>
        {/* Remove the remaining periods display */}
        {/* <div
          className="remaining-periods"
          style={{
            color: "wheat",
            marginBottom: "15px",
            fontSize: "1.1rem",
          }}
        >
          {completedPomodoros} of {POMODOROS_UNTIL_LONG_BREAK} pomodoros
          completed
        </div> */}
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
