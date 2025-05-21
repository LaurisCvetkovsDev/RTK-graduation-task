import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Friend {
  id: string
  name: string
  pomodoros: number
}

export interface PomodoroState {
  dailyCount: number
  totalCount: number
  dailyGoal: number
  timerDuration: number // in minutes
  completedMinutes: number // track completed minutes
  isWorkPhase: boolean // true for work, false for rest
  workDuration: number // duration of work phase (default 25)
  restDuration: number // duration of rest phase (default 5)
  friends: Friend[]
  incrementCount: (minutes: number) => void
  resetDailyCount: () => void
  setDailyGoal: (goal: number) => void
  setTimerDuration: (duration: number) => void
  togglePhase: () => void
  addFriend: (name: string) => void
  deleteFriend: (id: string) => void
  updateFriendPomodoros: (id: string, pomodoros: number) => void
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      dailyCount: 0,
      totalCount: 0,
      dailyGoal: 5, // Default daily goal
      timerDuration: 25, // Default 25 minutes (one pomodoro)
      completedMinutes: 0,
      isWorkPhase: true,
      workDuration: 25,
      restDuration: 5,
      friends: [],
      incrementCount: (minutes) => set((state) => {
        const newCompletedMinutes = state.completedMinutes + minutes;
        const pomodorosCompleted = Math.floor(newCompletedMinutes / 25);
        const remainingMinutes = newCompletedMinutes % 25;
        
        return {
          completedMinutes: remainingMinutes,
          dailyCount: state.dailyCount + pomodorosCompleted,
          totalCount: state.totalCount + pomodorosCompleted
        };
      }),
      resetDailyCount: () => set({ dailyCount: 0, completedMinutes: 0 }),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      setTimerDuration: (duration) => set({ 
        timerDuration: duration,
        workDuration: 25,
        restDuration: 5
      }),
      togglePhase: () => set((state) => ({ 
        isWorkPhase: !state.isWorkPhase,
        timerDuration: state.isWorkPhase ? state.restDuration : state.workDuration
      })),
      addFriend: (name) => set((state) => ({
        friends: [...state.friends, {
          id: Date.now().toString(),
          name,
          pomodoros: 0
        }]
      })),
      deleteFriend: (id) => set((state) => ({
        friends: state.friends.filter(friend => friend.id !== id)
      })),
      updateFriendPomodoros: (id, pomodoros) => set((state) => ({
        friends: state.friends.map(friend => 
          friend.id === id ? { ...friend, pomodoros } : friend
        )
      }))
    }),
    {
      name: 'pomodoro-storage', // unique name for localStorage
    }
  )
) 