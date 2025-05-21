import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PomodoroState {
  dailyCount: number
  totalCount: number
  dailyGoal: number
  timerDuration: number // in minutes
  incrementCount: () => void
  resetDailyCount: () => void
  setDailyGoal: (goal: number) => void
  setTimerDuration: (duration: number) => void
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      dailyCount: 0,
      totalCount: 0,
      dailyGoal: 5, // Default daily goal
      timerDuration: 50, // Default 50 minutes
      incrementCount: () => set((state) => ({
        dailyCount: state.dailyCount + 1,
        totalCount: state.totalCount + 1
      })),
      resetDailyCount: () => set({ dailyCount: 0 }),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      setTimerDuration: (duration) => set({ timerDuration: duration })
    }),
    {
      name: 'pomodoro-storage', // unique name for localStorage
    }
  )
) 