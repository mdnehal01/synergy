"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CustomTheme = 'light' | 'dark' | 'yellow'

type ThemeStore = {
    theme: CustomTheme
    setTheme: (theme: CustomTheme) => void
}

export const useCustomTheme = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'light',
            setTheme: (theme: CustomTheme) => {
                set({ theme })
                // Apply theme to document
                document.documentElement.className = theme
            }
        }),
        {
            name: 'synergie-theme-storage',
            onRehydrateStorage: () => (state) => {
                if (state?.theme) {
                    document.documentElement.className = state.theme
                }
            }
        }
    )
)