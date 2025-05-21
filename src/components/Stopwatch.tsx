import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import type { PomodoroState } from "../store/pomodoroStore";
import Settings from "./Settings";
import { sessionService } from "../services/api";
import { PomodoroSession } from "../types";

function CountdownTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const {
    timerDuration,
    setTimerDuration,
    isWorkPhase,
    togglePhase,
    workDuration,
    restDuration,
  } = usePomodoroStore();
  const [elapsedTime, setElapsedTime] = useState(timerDuration * 60 * 1000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const intervalIdRef = useRef<number | null>(null);
  const POMODOROdone = useRef(new Audio("./sounds/POMODOROdone2-1.mp3"));
  const incrementCount = usePomodoroStore(
    (state: PomodoroState) => state.incrementCount
  );
  const initialTimeRef = useRef(timerDuration * 60 * 1000);
  const totalSetTimeRef = useRef(timerDuration * 60 * 1000);
  const [remainingWorkPeriods, setRemainingWorkPeriods] = useState(0);
  const [timeUntilRest, setTimeUntilRest] = useState(workDuration * 60 * 1000);
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState("");

  // Mock user ID - replace with actual user ID from auth context
  const userId = 1;

  // Calculate remaining work periods
  const calculateRemainingWorkPeriods = useCallback((totalMinutes: number) => {
    const workPeriodDuration = 25;
    const restPeriodDuration = 5;
    const totalPeriodDuration = workPeriodDuration + restPeriodDuration;

    const completeCycles = Math.floor(totalMinutes / totalPeriodDuration);
    const remainingMinutes = totalMinutes % totalPeriodDuration;

    let remainingPeriods = completeCycles * 2; // Each cycle has 2 periods (work + rest)

    if (remainingMinutes > 0) {
      remainingPeriods += 1; // Add the current period
      if (remainingMinutes > workPeriodDuration) {
        remainingPeriods += 1; // Add the rest period if we're in it
      }
    }

    return remainingPeriods;
  }, []);

  // Calculate time until next rest
  const calculateTimeUntilRest = useCallback((currentTime: number) => {
    const workPeriodDuration = 25 * 60; // 25 minutes in seconds
    const timeInCurrentPeriod = currentTime % workPeriodDuration;
    return workPeriodDuration - timeInCurrentPeriod;
  }, []);

  // Update elapsed time when timer duration changes
  useEffect(() => {
    setElapsedTime(timerDuration * 60 * 1000);
    initialTimeRef.current = timerDuration * 60 * 1000;
    totalSetTimeRef.current = timerDuration * 60 * 1000;
    setRemainingWorkPeriods(
      calculateRemainingWorkPeriods(timerDuration * 60 * 1000)
    );
    setTimeUntilRest(workDuration * 60 * 1000);
  }, [timerDuration]);

  const handleTimerEnd = () => {
    if (localStorage.getItem("timerUpdated") === "true") return;
    localStorage.setItem("timerUpdated", "true");

    // Calculate completed minutes only during work phase
    if (isWorkPhase) {
      const completedMinutes = Math.floor(
        (initialTimeRef.current - elapsedTime) / (60 * 1000)
      );
      if (completedMinutes > 0) {
        incrementCount(completedMinutes);
        POMODOROdone.current.play();
      }
    }

    // Toggle phase and reset timer
    togglePhase();
    setElapsedTime(timerDuration * 60 * 1000);
    initialTimeRef.current = timerDuration * 60 * 1000;
    setTimeUntilRest(isWorkPhase ? 0 : workDuration * 60 * 1000);

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
          const newTime = prev - 10;
          // Update remaining work periods and time until rest
          setRemainingWorkPeriods(calculateRemainingWorkPeriods(newTime));
          setTimeUntilRest(calculateTimeUntilRest(newTime));
          return newTime;
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
      // Calculate completed minutes only during work phase
      if (isWorkPhase) {
        const completedMinutes = Math.floor(
          (initialTimeRef.current - elapsedTime) / (60 * 1000)
        );
        if (completedMinutes > 0) {
          incrementCount(completedMinutes);
        }
      }
    }
    setIsRunning(false);
  }

  function reset() {
    setElapsedTime(timerDuration * 60 * 1000);
    initialTimeRef.current = timerDuration * 60 * 1000;
    totalSetTimeRef.current = timerDuration * 60 * 1000;
    setRemainingWorkPeriods(
      calculateRemainingWorkPeriods(timerDuration * 60 * 1000)
    );
    setTimeUntilRest(workDuration * 60 * 1000);
    setIsRunning(false);
  }

  function formatTime(timeInMs: number) {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const milliseconds = Math.floor((timeInMs % 1000) / 10);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}:${String(milliseconds).padStart(2, "0")}`;
  }

  const handleStart = () => {
    if (!userInput) {
      setError("Please enter a duration");
      return;
    }
    const minutes = parseInt(userInput);
    if (isNaN(minutes) || minutes <= 0) {
      setError("Please enter a valid duration");
      return;
    }
    setError("");
    setIsRunning(true);
    setRemainingWorkPeriods(calculateRemainingWorkPeriods(minutes));
  };

  const handleStop = async () => {
    setIsRunning(false);

    // Save the session to the backend
    try {
      const session: Omit<PomodoroSession, "id"> = {
        user_id: userId,
        start_time: new Date(Date.now() - elapsedTime / 1000).toISOString(),
        end_time: new Date().toISOString(),
        duration: elapsedTime,
        is_completed: completedMinutes >= 25,
      };

      await sessionService.createSession(session);
    } catch (err) {
      console.error("Failed to save session:", err);
    }

    // Reset the timer
    setElapsedTime(timerDuration * 60 * 1000);
    initialTimeRef.current = timerDuration * 60 * 1000;
    setRemainingWorkPeriods(
      calculateRemainingWorkPeriods(timerDuration * 60 * 1000)
    );
    setTimeUntilRest(workDuration * 60 * 1000);
    setCompletedMinutes(0);
    setUserInput("");
  };

  return (
    <>
      <div className="stopWatch">
        <div
          className="phase-indicator"
          style={{
            color: isWorkPhase ? "#ff6b6b" : "#4a90e2",
            marginBottom: "10px",
            fontSize: "1.2rem",
          }}
        >
          {isWorkPhase ? "Work Time" : "Rest Time"}
        </div>
        <div className="display">
          {isWorkPhase
            ? formatTime(timeUntilRest)
            : formatTime(restDuration * 60 * 1000)}
        </div>
        <div
          className="remaining-periods"
          style={{
            color: "wheat",
            marginBottom: "15px",
            fontSize: "1.1rem",
          }}
        >
          {remainingWorkPeriods} work period
          {remainingWorkPeriods !== 1 ? "s" : ""} remaining
        </div>
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
