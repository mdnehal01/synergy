"use client"

import React, { useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, Edit3, Check, X } from 'lucide-react'

interface TextNodeData {
  label: string
  editable?: boolean
}

export const CustomTextNode: React.FC<NodeProps> = ({ 
  data, 
  selected,
  id
}) => {
  const nodeData = data as unknown as TextNodeData
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(nodeData.label || 'Text')
  const [tempLabel, setTempLabel] = useState(label)

  const handleEdit = useCallback(() => {
    if (!nodeData.editable) return
    setTempLabel(label)
    setIsEditing(true)
  }, [label, nodeData.editable])

  const handleSave = useCallback(() => {
    setLabel(tempLabel)
    setIsEditing(false)
    // Update the node data
    nodeData.label = tempLabel
  }, [tempLabel, nodeData])

  const handleCancel = useCallback(() => {
    setTempLabel(label)
    setIsEditing(false)
  }, [label])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [handleSave, handleCancel])

  return (
    <div className={`
      px-4 py-2 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 min-w-[120px]
      ${selected ? 'border-theme-green' : 'border-gray-200 dark:border-gray-600'}
      ${nodeData.editable ? 'hover:border-theme-lightgreen' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-theme-green"
      />
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-6 text-sm border-none p-0 focus-visible:ring-0"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
              {label}
            </span>
            {nodeData.editable && selected && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-theme-green"
      />
    </div>
  )
}