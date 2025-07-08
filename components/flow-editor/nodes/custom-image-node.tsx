"use client"

import React, { useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Upload, Check, X } from 'lucide-react'
import Image from 'next/image'

interface ImageNodeData {
  src?: string
  alt: string
  editable?: boolean
}

export const CustomImageNode: React.FC<NodeProps<ImageNodeData>> = ({ 
  data, 
  selected 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [imageUrl, setImageUrl] = useState(data.src || '')
  const [tempUrl, setTempUrl] = useState(imageUrl)

  const handleEdit = useCallback(() => {
    if (!data.editable) return
    setTempUrl(imageUrl)
    setIsEditing(true)
  }, [imageUrl, data.editable])

  const handleSave = useCallback(() => {
    setImageUrl(tempUrl)
    setIsEditing(false)
    data.src = tempUrl
  }, [tempUrl, data])

  const handleCancel = useCallback(() => {
    setTempUrl(imageUrl)
    setIsEditing(false)
  }, [imageUrl])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [handleSave, handleCancel])

  return (
    <div className={`
      p-2 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 min-w-[120px] min-h-[80px] group
      ${selected ? 'border-theme-green' : 'border-gray-200 dark:border-gray-600'}
      ${data.editable ? 'hover:border-theme-lightgreen' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-theme-green"
      />
      
      <div className="flex flex-col items-center gap-2">
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full">
            <Input
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter image URL"
              className="h-8 text-sm"
              autoFocus
            />
            <div className="flex gap-1 justify-center">
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
          </div>
        ) : (
          <>
            {imageUrl ? (
              <div className="relative w-20 h-20 rounded overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={data.alt}
                  fill
                  className="object-cover"
                  onError={() => setImageUrl('')}
                />
              </div>
            ) : (
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            {data.editable && selected && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-6 opacity-0 group-hover:opacity-100 flex items-center gap-1"
              >
                <Upload className="h-3 w-3" />
                <span className="text-xs">Edit</span>
              </Button>
            )}
          </>
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