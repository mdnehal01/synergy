"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ColorTheme = 'default' | 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'pink' | 'teal'

interface ThemeColorsStore {
  currentTheme: ColorTheme
  setTheme: (theme: ColorTheme) => void
}

export const useThemeColors = create<ThemeColorsStore>()(
  persist(
    (set) => ({
      currentTheme: 'default',
      setTheme: (theme: ColorTheme) => {
        set({ currentTheme: theme })
        // Apply theme to document root
        document.documentElement.setAttribute('data-color-theme', theme)
      },
    }),
    {
      name: 'synergie-color-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.currentTheme) {
          document.documentElement.setAttribute('data-color-theme', state.currentTheme)
        }
      },
    }
  )
)