"use client"

import { Eye, Workflow } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'

interface EditModeToggleProps {
  isEditMode: boolean
  onToggle: () => void
  showFlowToggle?: boolean
  showFlowEditor?: boolean
  onFlowToggle?: () => void
}

const EditModeToggle: React.FC<EditModeToggleProps> = ({
  isEditMode,
  onToggle,
  showFlowToggle = false,
  showFlowEditor = false,
  onFlowToggle,
}) => {
  return (
    <div className={`absolute top-[50px] z-50 left-1/2 right-0 px-32 -translate-x-1/2 w-full ${!isEditMode ? 'bg-neutral-200 dark:bg-neutral-950 shadow': 'bg-transparent shadow-none'} py-2 flex items-center justify-between`}>
      {/* Mode Label with Icon */}
      <div className="flex items-center gap-2 text-sm font-medium">
        {isEditMode ? (
          <>
            {showFlowToggle && onFlowToggle && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFlowToggle}
                className={`flex items-center gap-2 ${showFlowEditor ? 'bg-theme-green text-white hover:bg-theme-lightgreen' : ''}`}
              >
                <Workflow className="h-4 w-4" />
                {showFlowEditor ? 'Flow Mode' : 'Enable Flow'}
              </Button>
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
