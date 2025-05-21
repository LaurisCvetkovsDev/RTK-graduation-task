import React from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import gif102401 from "../assets/000102401.gif";

const Friends = () => {
  const totalCount = usePomodoroStore((state) => state.totalCount);

  // This is a placeholder for the friends list
  const friends = [
    { name: "Friend 1", pomodoros: 25 },
    { name: "Friend 2", pomodoros: 18 },
    { name: "Friend 3", pomodoros: 30 },
  ];

  return (
    <div className="friends">
      <h2 className="mb-4">Friends Leaderboard</h2>
      <div className="your-stats mb-4">
        <h3>Your Progress</h3>
        <p>
          Total{" "}
          <img
            src={gif102401}
            alt="gif"
            style={{ height: "30px", width: "auto" }}
          />
          : {totalCount}
        </p>
      </div>
      <div className="friends-list">
        <h3>Friends</h3>
        <div className="list-group">
          {friends.map((friend, index) => (
            <div key={index} className="list-group-item glass-item">
              <div className="d-flex justify-content-between align-items-center">
                <span>{friend.name}</span>
                <span>
                  {friend.pomodoros}{" "}
                  <img
                    src={gif102401}
                    alt="gif"
                    style={{ height: "30px", width: "auto" }}
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Friends;
