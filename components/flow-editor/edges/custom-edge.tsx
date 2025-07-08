"use client"

import React from 'react'
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const onEdgeClick = () => {
    // Handle edge deletion or other actions
    if (data?.onDelete) {
      data.onDelete(id)
    }
  }

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: selected ? '#01FF5A' : '#6b7280',
          strokeWidth: selected ? 3 : 2,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {selected && data?.editable && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <Button
              size="sm"
              variant="destructive"
              onClick={onEdgeClick}
              className="h-6 w-6 p-0 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}