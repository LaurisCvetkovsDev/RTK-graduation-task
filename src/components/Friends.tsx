import React, { useState, useEffect } from "react";
import { friendService } from "../services/api";
import { Friend } from "../types";
import gif102401 from "../assets/000102401.gif";

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendId, setNewFriendId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mock user ID - replace with actual user ID from auth context
  const userId = 1;

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const friendsList = await friendService.getFriends(userId);
      setFriends(friendsList);
    } catch (err) {
      setError("Failed to load friends");
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const friendId = parseInt(newFriendId);
      if (isNaN(friendId)) {
        throw new Error("Please enter a valid user ID");
      }

      await friendService.addFriend(userId, friendId);
      setSuccess("Friend request sent successfully");
      setNewFriendId("");
      loadFriends();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send friend request"
      );
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      await friendService.removeFriend(userId, friendId);
      setSuccess("Friend removed successfully");
      loadFriends();
    } catch (err) {
      setError("Failed to remove friend");
    }
  };

  const handleAcceptFriend = async (friendId: number) => {
    try {
      await friendService.acceptFriend(userId, friendId);
      setSuccess("Friend request accepted");
      loadFriends();
    } catch (err) {
      setError("Failed to accept friend request");
    }
  };

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
          : {friends.length}
        </p>
      </div>
      <div className="friends-list">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Friends</h3>
          <form onSubmit={handleAddFriend} className="add-friend-form">
            <input
              type="text"
              value={newFriendId}
              onChange={(e) => setNewFriendId(e.target.value)}
              placeholder="Enter friend's user ID"
              required
            />
            <button type="submit">Add Friend</button>
          </form>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="list-group">
          {friends.length === 0 ? (
            <div className="text-center text-wheat">No friends added yet</div>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="list-group-item glass-item">
                <div className="d-flex justify-content-between align-items-center">
                  <span>{friend.username}</span>
                  <div className="d-flex align-items-center">
                    <span className="me-3">
                      {friend.pomodoros}{" "}
                      <img
                        src={gif102401}
                        alt="gif"
                        style={{ height: "30px", width: "auto" }}
                      />
                    </span>
                    {friend.status === "pending" &&
                      friend.user_id === userId && (
                        <button
                          onClick={() => handleAcceptFriend(friend.friend_id)}
                          className="btn btn-primary btn-sm"
                          style={{
                            backgroundColor: "wheat",
                            borderColor: "black",
                            color: "black",
                          }}
                        >
                          Accept
                        </button>
                      )}
                    <button
                      onClick={() => handleRemoveFriend(friend.friend_id)}
                      className="btn btn-danger btn-sm"
                      style={{
                        backgroundColor: "rgba(255, 0, 0, 0.2)",
                        borderColor: "rgba(255, 0, 0, 0.3)",
                        color: "wheat",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
