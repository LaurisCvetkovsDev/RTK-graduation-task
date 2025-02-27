import React, { useState, useEffect, useRef } from "react";

function CountdownTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(50 * 60 * 1000);
  const intervalIdRef = useRef<number | null>(null);
  let POMODOROdone = new Audio("./sounds/POMODOROdone2-1.mp3");

  // Track whether handleTimerEnd has already been called
  const hasEnded = useRef(false);

  const handleTimerEnd = () => {
    if (hasEnded.current) return; // Prevent multiple calls
    hasEnded.current = true; // Mark as called

    const currentCount = parseInt(localStorage.getItem("timerCount") || "0");
    const newCount = currentCount + 1;
    localStorage.setItem("timerCount", newCount.toString());
  };

  useEffect(() => {
    if (isRunning) {
      intervalIdRef.current = window.setInterval(() => {
        setElapsedTime((prev) => {
          if (prev <= 10) {
            clearInterval(intervalIdRef.current!);
            POMODOROdone.play();
            handleTimerEnd(); // ✅ Ensure it only runs once
            return 0;
          }
          return prev - 10;
        });
      }, 10);
    } else {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
      hasEnded.current = false; // Reset when unmounting or restarting
    };
  }, [isRunning]);

  function start() {
    if (elapsedTime > 0) setIsRunning(true);
    hasEnded.current = false; // Reset when starting new timer
  }
  function stop() {
    setIsRunning(false);
  }
  function reset() {
    setElapsedTime(50);
    setIsRunning(false);
    hasEnded.current = false; // Reset so next timer works properly
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
      </div>
    </>
  );
}

export default CountdownTimer;
