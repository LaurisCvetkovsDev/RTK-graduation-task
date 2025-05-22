import { create } from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'

export interface Friend {
  id: string
  name: string
  pomodoros: number
}

export interface PomodoroState {
  dailyCount: number
  totalCount: number
  dailyGoal: number
  completedMinutes: number // track completed minutes
  isWorkPhase: boolean // true for work, false for rest
  workDuration: number // duration of work phase in minutes
  shortBreakDuration: number // duration of short break in minutes
  friends: Friend[]
  isCompleted: boolean // track if a pomodoro session is completed
  incrementCount: (minutes: number) => void
  resetDailyCount: () => void
  setDailyGoal: (goal: number) => void
  setWorkDuration: (duration: number) => void
  setShortBreakDuration: (duration: number) => void
  togglePhase: () => void
  addFriend: (name: string) => void
  deleteFriend: (id: string) => void
  updateFriendPomodoros: (id: string, pomodoros: number) => void
  refreshFriends: number; // Use a number to trigger effect on change
  triggerFriendsRefresh: () => void;
  setCompleted: (completed: boolean) => void // Add setter for isCompleted
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      dailyCount: 0,
      totalCount: 0,
      dailyGoal: 5, // Default daily goal
      completedMinutes: 0,
      isWorkPhase: true,
      workDuration: 25, // Default 25 minutes for a standard pomodoro session
      shortBreakDuration: 5, // Default 5 minutes
      friends: [],
      isCompleted: false, // Initialize isCompleted as false
      incrementCount: (minutes) => set((state) => {
        const newCompletedMinutes = state.completedMinutes + minutes;
        const pomodorosCompleted = Math.floor(newCompletedMinutes / state.workDuration);
        const remainingMinutes = newCompletedMinutes % state.workDuration;
        
        return {
          completedMinutes: remainingMinutes, // keep remaining minutes for partial pomodoros
          dailyCount: state.dailyCount + pomodorosCompleted,
          totalCount: state.totalCount + pomodorosCompleted
        };
      }),
      resetDailyCount: () => set({ dailyCount: 0, completedMinutes: 0 }),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      setWorkDuration: (duration) => set({ workDuration: duration }),
      setShortBreakDuration: (duration) => set({ shortBreakDuration: duration }),
      togglePhase: () => set((state) => ({ isWorkPhase: !state.isWorkPhase })),
      addFriend: (name) => set((state) => ({
        friends: [...state.friends, {
          id: Date.now().toString(),
          name,
          pomodoros: 0 // Initialize pomodoros for new friend
        }]
      })),
      deleteFriend: (id) => set((state) => ({
        friends: state.friends.filter(friend => friend.id !== id)
      })),
      updateFriendPomodoros: (id, pomodoros) => set((state) => ({
        friends: state.friends.map(friend => 
          friend.id === id ? { ...friend, pomodoros } : friend
        )
      })),
      refreshFriends: 0,
      triggerFriendsRefresh: () => set(state => ({ refreshFriends: state.refreshFriends + 1})),
      setCompleted: (completed) => set({ isCompleted: completed }), // Add setter for isCompleted
    }),
    {
      name: 'pomodoro-storage', // unique name for localStorage
      onRehydrateStorage: (state) => {
        // This function runs when the store is rehydrating
        return (state, error) => {
          if (error) {
            console.error('an error happened during hydration', error)
          } else {
            // Check the loaded state and reset isWorkPhase if needed
            if (state && !state.isWorkPhase) {
              state.isWorkPhase = true;
              // Optionally reset timer or other related state if needed
              // state.timeLeft = state.workDuration * 60 * 1000; // This will be handled by useEffect in Stopwatch.tsx
            }
          }
        }
      }
    }
  )
) 