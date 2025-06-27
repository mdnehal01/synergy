"use client"

import { Button } from "@/components/ui/button"
import { useCustomTheme } from "@/hooks/use-theme-custom"
import { Check, Moon, Sun, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeSelector() {
  const { theme, setTheme } = useCustomTheme()

  const themes = [
    {
      name: 'Light',
      value: 'light' as const,
      icon: Sun,
      preview: 'bg-white border-gray-200'
    },
    {
      name: 'Dark', 
      value: 'dark' as const,
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      name: 'Yellow',
      value: 'yellow' as const,
      icon: Palette,
      preview: 'bg-amber-50 border-amber-200'
    }
  ]

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Choose Theme</div>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isSelected = theme === themeOption.value
          
          return (
            <Button
              key={themeOption.value}
              variant="outline"
              size="sm"
              className={cn(
                "relative h-16 flex flex-col items-center justify-center gap-1 p-2",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => setTheme(themeOption.value)}
            >
              <div className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center",
                themeOption.preview
              )}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-xs">{themeOption.name}</span>
              {isSelected && (
                <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}