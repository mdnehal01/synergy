"use client"

import { cn } from "@/lib/utils"
import { useThemeColors, ColorTheme } from "@/hooks/use-theme-colors"
import { Check } from "lucide-react"

const colorThemes = [
  {
    name: 'gradient',
    label: 'Gradient',
    primary: '#667eea',
    secondary: '#764ba2',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: 'default',
    label: 'Default',
    primary: '#017149',
    secondary: '#01FF5A',
    preview: '#017149'
  },
  {
    name: 'blue',
    label: 'Ocean Blue',
    primary: '#0066CC',
    secondary: '#4DA6FF',
    preview: '#0066CC'
  },
  {
    name: 'purple',
    label: 'Royal Purple',
    primary: '#7C3AED',
    secondary: '#A78BFA',
    preview: '#7C3AED'
  },
  {
    name: 'orange',
    label: 'Sunset Orange',
    primary: '#EA580C',
    secondary: '#FB923C',
    preview: '#EA580C'
  },
  {
    name: 'red',
    label: 'Cherry Red',
    primary: '#DC2626',
    secondary: '#F87171',
    preview: '#DC2626'
  },
  {
    name: 'pink',
    label: 'Rose Pink',
    primary: '#E11D48',
    secondary: '#FB7185',
    preview: '#E11D48'
  },
  {
    name: 'teal',
    label: 'Emerald Teal',
    primary: '#0D9488',
    secondary: '#5EEAD4',
    preview: '#0D9488'
  },
  {
    name: 'green',
    label: 'Forest Green',
    primary: '#059669',
    secondary: '#6EE7B7',
    preview: '#059669'
  }
] as const

export function ColorPalette() {
  const { currentTheme, setTheme } = useThemeColors()

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Color Theme</h4>
      <div className="grid grid-cols-4 gap-3">
        {colorThemes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => setTheme(theme.name as ColorTheme)}
            className={cn(
              "relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
              currentTheme === theme.name 
                ? "border-foreground shadow-lg" 
                : "border-border hover:border-foreground/50"
            )}
            style={{ 
              background: theme.preview,
              backgroundColor: typeof theme.preview === 'string' && theme.preview.startsWith('#') ? theme.preview : undefined
            }}
            title={theme.label}
          >
            {currentTheme === theme.name && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-4 h-4 text-white drop-shadow-sm" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}