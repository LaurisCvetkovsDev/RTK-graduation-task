import React from "react";

const About: React.FC = () => {
  return (
    <div className="about-container">
      <h2>About Pomodoro Timer</h2>
      <div className="about-content">
        <p>
          The Pomodoro Technique is a time management method developed by
          Francesco Cirillo in the late 1980s. It uses a timer to break work
          into intervals, traditionally 25 minutes in length, separated by short
          breaks.
        </p>
        <h3>How to Use This App</h3>
        <ol>
          <li>Set your work duration (default is 25 minutes)</li>
          <li>Set your break duration (default is 5 minutes)</li>
          <li>Click "Start" to begin your work session</li>
          <li>When the timer ends, take your break</li>
          <li>Repeat the process to maintain productivity</li>
        </ol>
        <h3>Features</h3>
        <ul>
          <li>Customizable work and break durations</li>
          <li>Track your daily and total completed pomodoros</li>
          <li>Connect with friends and share your progress</li>
          <li>View your productivity statistics</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
