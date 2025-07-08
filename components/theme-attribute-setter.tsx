"use client"

import { useEffect } from 'react'
import { useThemeColors } from '@/hooks/use-theme-colors'

export function ThemeAttributeSetter() {
  const { currentTheme } = useThemeColors()

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-color-theme', currentTheme)
    }
  }, [currentTheme])

  // This component doesn't render anything
  return null
}