import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PomodoroState {
  dailyCount: number
  totalCount: number
  dailyGoal: number
  timerDuration: number // in minutes
  completedMinutes: number // track completed minutes
  incrementCount: (minutes: number) => void
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
      timerDuration: 25, // Default 25 minutes (one pomodoro)
      completedMinutes: 0,
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
      setTimerDuration: (duration) => set({ timerDuration: duration })
    }),
    {
      name: 'pomodoro-storage', // unique name for localStorage
    }
  )
) 