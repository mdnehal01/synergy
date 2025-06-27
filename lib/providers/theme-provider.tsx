"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useCustomTheme } from "@/hooks/use-theme-custom"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { theme } = useCustomTheme()
  
  React.useEffect(() => {
    // Apply custom theme on mount
    if (theme) {
      document.documentElement.className = theme
    }
  }, [theme])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}