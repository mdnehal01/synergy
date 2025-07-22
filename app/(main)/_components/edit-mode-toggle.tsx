"use client"

import { Eye, Workflow, FileText, Split } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EditModeToggleProps {
  isEditMode: boolean
  onToggle: () => void
  showFlowToggle?: boolean
  viewMode?: 'editor' | 'flow' | 'split'
  onViewModeChange?: (mode: 'editor' | 'flow' | 'split') => void
}

const EditModeToggle: React.FC<EditModeToggleProps> = ({
  isEditMode,
  onToggle,
  showFlowToggle = false,
  viewMode = 'editor',
  onViewModeChange,
}) => {
  return (
    <div className={`absolute top-[50px] z-50 left-1/2 right-0 px-32 -translate-x-1/2 w-full ${!isEditMode ? 'bg-neutral-200 dark:bg-neutral-950 shadow': 'bg-transparent shadow-none'} py-2 flex items-center justify-between`}>
      {/* View Mode Controls */}
      <div className="flex items-center gap-2 text-sm font-medium">
        {isEditMode ? (
          <>
            {showFlowToggle && onViewModeChange && (
              <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-md p-1 border">
                <Button
                  variant={viewMode === 'editor' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('editor')}
                  className={cn(
                    "flex items-center gap-2 h-8",
                    viewMode === 'editor' && "bg-theme-green hover:bg-theme-lightgreen text-white"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Editor
                </Button>
                
                <Button
                  variant={viewMode === 'flow' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('flow')}
                  className={cn(
                    "flex items-center gap-2 h-8",
                    viewMode === 'flow' && "bg-theme-green hover:bg-theme-lightgreen text-white"
                  )}
                >
                  <Workflow className="h-4 w-4" />
                  Canvas
                </Button>
                
                <Button
                  variant={viewMode === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('split')}
                  className={cn(
                    "flex items-center gap-2 h-8",
                    viewMode === 'split' && "bg-theme-green hover:bg-theme-lightgreen text-white"
                  )}
                >
                  <Split className="h-4 w-4" />
                  Split
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <p>This page is in </p>
            <Eye className="h-4 w-4" />
            View Mode
            <p>Press toggle to turn to edit mode</p>
          </>
        )}
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center gap-3">
        <label className="relative inline-block w-12 h-6 cursor-pointer">
        <input
          type="checkbox"
          checked={isEditMode}
          onChange={onToggle}
          className="peer sr-only"
        />
        <div className="w-full h-full rounded-full bg-gray-300 peer-checked:bg-gray-900 dark:peer-checked:bg-neutral-100 transition-colors"></div>
        <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-theme-lightgreen transition-transform peer-checked:translate-x-6"></div>
        {isEditMode &&
            <p className='w-44 text-xs'>Edit On</p>
        }
        </label>
      </div>
    </div>
  )
}

export default EditModeToggle
