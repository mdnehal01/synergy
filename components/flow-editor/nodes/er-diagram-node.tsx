"use client"

import React, { useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Edit3, Check, X, Plus, Trash2, Key } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Attribute {
  name: string
  type: string
  isPrimary: boolean
}

interface ERDiagramNodeData {
  entityName: string
  attributes: Attribute[]
  editable?: boolean
}

export const ERDiagramNode: React.FC<NodeProps> = ({ 
  data, 
  selected 
}) => {
  const nodeData = data as unknown as ERDiagramNodeData
  const [isEditing, setIsEditing] = useState(false)
  const [entityName, setEntityName] = useState(nodeData.entityName || 'Entity')
  const [attributes, setAttributes] = useState<Attribute[]>(nodeData.attributes || [])
  const [tempEntityName, setTempEntityName] = useState(entityName)
  const [tempAttributes, setTempAttributes] = useState<Attribute[]>(attributes)

  const handleEdit = useCallback(() => {
    if (!nodeData.editable) return
    setTempEntityName(entityName)
    setTempAttributes([...attributes])
    setIsEditing(true)
  }, [entityName, attributes, nodeData.editable])

  const handleSave = useCallback(() => {
    setEntityName(tempEntityName)
    setAttributes([...tempAttributes])
    setIsEditing(false)
    // Update the node data
    nodeData.entityName = tempEntityName
    nodeData.attributes = [...tempAttributes]
  }, [tempEntityName, tempAttributes, nodeData])

  const handleCancel = useCallback(() => {
    setTempEntityName(entityName)
    setTempAttributes([...attributes])
    setIsEditing(false)
  }, [entityName, attributes])

  const addAttribute = useCallback(() => {
    setTempAttributes(prev => [...prev, { name: 'new_field', type: 'VARCHAR(255)', isPrimary: false }])
  }, [])

  const removeAttribute = useCallback((index: number) => {
    setTempAttributes(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateAttribute = useCallback((index: number, field: keyof Attribute, value: string | boolean) => {
    setTempAttributes(prev => prev.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    ))
  }, [])

  const togglePrimaryKey = useCallback((index: number) => {
    setTempAttributes(prev => prev.map((attr, i) => 
      i === index ? { ...attr, isPrimary: !attr.isPrimary } : attr
    ))
  }, [])

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border-2 rounded-lg shadow-lg min-w-[200px] group",
      selected ? 'border-theme-green' : 'border-gray-200 dark:border-gray-600',
      nodeData.editable ? 'hover:border-theme-lightgreen' : ''
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-theme-green"
      />
      
      {/* Entity Header */}
      <div className="bg-theme-green text-white p-3 rounded-t-lg">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={tempEntityName}
              onChange={(e) => setTempEntityName(e.target.value)}
              className="h-6 text-sm bg-white text-black border-none p-1"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="h-6 w-6 p-0 text-white hover:bg-theme-lightgreen"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6 p-0 text-white hover:bg-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{entityName}</h3>
            {nodeData.editable && selected && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-white hover:bg-theme-lightgreen"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Attributes */}
      <div className="p-2">
        {isEditing ? (
          <div className="space-y-2">
            {tempAttributes.map((attr, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => togglePrimaryKey(index)}
                  className={cn(
                    "h-4 w-4 p-0",
                    attr.isPrimary ? "text-yellow-500" : "text-gray-400"
                  )}
                >
                  <Key className="h-2 w-2" />
                </Button>
                <Input
                  value={attr.name}
                  onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                  className="h-5 text-xs flex-1 min-w-0"
                  placeholder="Field name"
                />
                <Input
                  value={attr.type}
                  onChange={(e) => updateAttribute(index, 'type', e.target.value)}
                  className="h-5 text-xs w-20"
                  placeholder="Type"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAttribute(index)}
                  className="h-4 w-4 p-0 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-2 w-2" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={addAttribute}
              className="h-5 w-full text-xs text-theme-green hover:bg-theme-lightgreen/10"
            >
              <Plus className="h-2 w-2 mr-1" />
              Add Field
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {attributes.map((attr, index) => (
              <div key={index} className="flex items-center gap-2 text-xs py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                {attr.isPrimary && <Key className="h-3 w-3 text-yellow-500" />}
                <span className={cn(
                  "font-medium flex-1",
                  attr.isPrimary && "text-yellow-600 dark:text-yellow-400"
                )}>
                  {attr.name}
                </span>
                <span className="text-gray-500 text-xs">{attr.type}</span>
              </div>
            ))}
            {attributes.length === 0 && (
              <div className="text-xs text-gray-400 italic py-2">No attributes</div>
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