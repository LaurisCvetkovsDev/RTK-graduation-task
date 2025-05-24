import React, { useState, useEffect } from "react";
import { friendService } from "../services/api";
import { Friend } from "../types";
import Avatar from "boring-avatars";
import { useAuth } from "../contexts/AuthContext";
import { usePomodoroStore } from "../store/pomodoroStore";

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userCounts, setUserCounts] = useState({ daily: 0, total: 0 });

  const { user } = useAuth();
  const { isCompleted } = usePomodoroStore();

  useEffect(() => {
    if (user) {
      loadFriends(user.id);
      loadUserCounts(user.id);
    } else {
      // Clear friends list if user logs out
      setFriends([]);
      setUserCounts({ daily: 0, total: 0 });
    }
  }, [user]);

  // Add effect to refresh counts when a pomodoro is completed
  useEffect(() => {
    if (user && isCompleted) {
      loadUserCounts(user.id);
      loadFriends(user.id); // Also refresh friends list to update their counts
    }
  }, [isCompleted, user]);

  const loadUserCounts = async (userId: number) => {
    try {
      const response = await fetch(
        `https://laucve1.dreamhosters.com/backend/api/friend_actions.php?action=get_user_counts&user_id=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch user counts");
      const data = await response.json();
      setUserCounts({
        daily: data.daily_pomodoros || 0,
        total: data.total_pomodoros || 0,
      });
    } catch (err) {
      console.error("Failed to load user counts:", err);
    }
  };

  const loadFriends = async (currentUserId: number) => {
    try {
      const friendsList = await friendService.getFriends(currentUserId);
      // Ensure friendsList is an array before setting state
      if (Array.isArray(friendsList)) {
        setFriends(friendsList);
      } else {
        console.error(
          "API did not return an array for friends list:",
          friendsList
        );
        setFriends([]); // Set to empty array on unexpected response
        setError("Received unexpected data from server.");
      }
    } catch (err) {
      console.error("Failed to load friends:", err);
      setError("Failed to load friends");
      setFriends([]); // Clear friends list on error to prevent rendering issues
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be logged in to add friends.");
      return;
    }

    if (newFriendUsername.trim() === "") {
      setError("Please enter a username.");
      return;
    }

    try {
      // Call addFriend with user.id and the username
      await friendService.addFriend(user.id, newFriendUsername.trim());
      setSuccess(`Friend request sent to ${newFriendUsername.trim()}.`);
      setNewFriendUsername("");
      loadFriends(user.id); // Reload friends after adding attempt
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send friend request"
      );
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!user) return;
    try {
      await friendService.removeFriend(user.id, friendId);
      setSuccess("Friend removed successfully");
      loadFriends(user.id);
    } catch (err) {
      setError("Failed to remove friend");
    }
  };

  const handleAcceptFriend = async (friendId: number) => {
    if (!user) return;
    try {
      await friendService.acceptFriend(user.id, friendId);
      setSuccess("Friend request accepted");
      loadFriends(user.id);
    } catch (err) {
      setError("Failed to accept friend request");
    }
  };

  // Separate pending requests from accepted friends
  const pendingRequests = friends.filter(
    (friend) => friend.status === "pending" && friend.user_id !== user?.id
  );
  const acceptedFriends = friends.filter(
    (friend) => friend.status === "accepted"
  );
  const sentRequests = friends.filter(
    (friend) => friend.status === "pending" && friend.user_id === user?.id
  );

  return (
    <div className="friends">
      <h2 className="mb-4">Friends Leaderboard</h2>

      {user && (
        <div className="glass-item mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Avatar
                size={40}
                name={user.username || user.id.toString()}
                variant="beam"
                colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
              />
              <span className="ms-3 fs-5">{user.username || "You"}</span>
            </div>
            <div className="d-flex align-items-center gap-4">
              <div className="text-center">
                <div className="fw-bold">Today</div>
                <div>{userCounts.daily}</div>
              </div>
              <div className="text-center">
                <div className="fw-bold">Total</div>
                <div>{userCounts.total}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="friends-list">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Friends</h3>
          <form
            onSubmit={handleAddFriend}
            className="add-friend-form d-flex gap-2"
          >
            <div className="input-group">
              <input
                type="text"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                placeholder="Username"
                className="form-control"
                required
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "wheat",
                }}
              />
              <style>
                {`
                  .form-control::placeholder {
                    color: white;
                    opacity: 0.7;
                  }
                `}
              </style>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  backgroundColor: "wheat",
                  borderColor: "black",
                  color: "black",
                }}
              >
                Add Friend
              </button>
            </div>
          </form>
        </div>
        {error && (
          <div className="error-message alert alert-danger">{error}</div>
        )}
        {success && (
          <div className="success-message alert alert-success">{success}</div>
        )}

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-wheat mb-3">Friend Requests</h4>
            <div className="list-group">
              {pendingRequests.map((friend) => (
                <div key={friend.id} className="list-group-item glass-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <Avatar
                        size={40}
                        name={friend.username || friend.id.toString()}
                        variant="beam"
                        colors={[
                          "#92A1C6",
                          "#146A7C",
                          "#F0AB3D",
                          "#C271B4",
                          "#C20D90",
                        ]}
                      />
                      <span className="ms-3">{friend.username}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => handleAcceptFriend(friend.id)}
                        className="btn btn-primary btn-sm"
                        style={{
                          backgroundColor: "wheat",
                          borderColor: "black",
                          color: "black",
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="btn btn-danger btn-sm"
                        style={{
                          backgroundColor: "rgba(255, 0, 0, 0.2)",
                          borderColor: "rgba(255, 0, 0, 0.3)",
                          color: "wheat",
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Requests Section */}
        {sentRequests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-wheat mb-3">Sent Requests</h4>
            <div className="list-group">
              {sentRequests.map((friend) => (
                <div key={friend.id} className="list-group-item glass-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <Avatar
                        size={40}
                        name={friend.username || friend.id.toString()}
                        variant="beam"
                        colors={[
                          "#92A1C6",
                          "#146A7C",
                          "#F0AB3D",
                          "#C271B4",
                          "#C20D90",
                        ]}
                      />
                      <span className="ms-3">{friend.username}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="text-wheat me-3">Pending</span>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="btn btn-danger btn-sm"
                        style={{
                          backgroundColor: "rgba(255, 0, 0, 0.2)",
                          borderColor: "rgba(255, 0, 0, 0.3)",
                          color: "wheat",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Friends Section */}
        <div>
          <h4 className="text-wheat mb-3">Friends List</h4>
          <div className="list-group">
            {acceptedFriends.length > 0 ? (
              acceptedFriends.map((friend) => (
                <div key={friend.id} className="list-group-item glass-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <Avatar
                        size={40}
                        name={friend.username || friend.id.toString()}
                        variant="beam"
                        colors={[
                          "#92A1C6",
                          "#146A7C",
                          "#F0AB3D",
                          "#C271B4",
                          "#C20D90",
                        ]}
                      />
                      <span className="ms-3">{friend.username}</span>
                    </div>
                    {/* Display Pomodoro Counts */}
                    <div className="d-flex align-items-center gap-4">
                      <div className="text-center">
                        <div className="fw-bold">Today</div>
                        <div>{friend.daily_pomodoros ?? 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="fw-bold">Total</div>
                        <div>{friend.total_pomodoros ?? 0}</div>
                      </div>
                      {/* Remove button for accepted friends */}
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="btn btn-danger btn-sm"
                        style={{
                          backgroundColor: "rgba(255, 0, 0, 0.2)",
                          borderColor: "rgba(255, 0, 0, 0.3)",
                          color: "wheat",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No friends added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
