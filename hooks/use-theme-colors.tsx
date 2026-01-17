"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ColorTheme = 'gradient' | 'default' | 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'pink' | 'teal'

interface ThemeColorsStore {
  currentTheme: ColorTheme
  setTheme: (theme: ColorTheme) => void
}

export const useThemeColors = create<ThemeColorsStore>()(
  persist(
    (set) => ({
      currentTheme: 'gradient',
      setTheme: (theme: ColorTheme) => {
        set({ currentTheme: theme })
      },
    }),
    {
      name: 'synergie-color-theme',
    }
  )
)