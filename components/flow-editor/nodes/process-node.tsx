"use client"

import React, { useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit3, Check, X, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProcessNodeData {
  processName: string
  description: string
  inputs: string[]
  outputs: string[]
  editable?: boolean
}

export const ProcessNode: React.FC<NodeProps> = ({ 
  data, 
  selected 
}) => {
  const nodeData = data as ProcessNodeData
  const [isEditing, setIsEditing] = useState(false)
  const [processName, setProcessName] = useState(nodeData.processName || 'Process')
  const [description, setDescription] = useState(nodeData.description || '')
  const [inputs, setInputs] = useState<string[]>(nodeData.inputs || [])
  const [outputs, setOutputs] = useState<string[]>(nodeData.outputs || [])
  
  const [tempProcessName, setTempProcessName] = useState(processName)
  const [tempDescription, setTempDescription] = useState(description)
  const [tempInputs, setTempInputs] = useState<string[]>(inputs)
  const [tempOutputs, setTempOutputs] = useState<string[]>(outputs)

  const handleEdit = useCallback(() => {
    if (!nodeData.editable) return
    setTempProcessName(processName)
    setTempDescription(description)
    setTempInputs([...inputs])
    setTempOutputs([...outputs])
    setIsEditing(true)
  }, [processName, description, inputs, outputs, nodeData.editable])

  const handleSave = useCallback(() => {
    setProcessName(tempProcessName)
    setDescription(tempDescription)
    setInputs([...tempInputs])
    setOutputs([...tempOutputs])
    setIsEditing(false)
    // Update the node data
    nodeData.processName = tempProcessName
    nodeData.description = tempDescription
    nodeData.inputs = [...tempInputs]
    nodeData.outputs = [...tempOutputs]
  }, [tempProcessName, tempDescription, tempInputs, tempOutputs, nodeData])

  const handleCancel = useCallback(() => {
    setTempProcessName(processName)
    setTempDescription(description)
    setTempInputs([...inputs])
    setTempOutputs([...outputs])
    setIsEditing(false)
  }, [processName, description, inputs, outputs])

  const addInput = useCallback(() => {
    setTempInputs(prev => [...prev, 'New Input'])
  }, [])

  const addOutput = useCallback(() => {
    setTempOutputs(prev => [...prev, 'New Output'])
  }, [])

  const removeInput = useCallback((index: number) => {
    setTempInputs(prev => prev.filter((_, i) => i !== index))
  }, [])

  const removeOutput = useCallback((index: number) => {
    setTempOutputs(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateInput = useCallback((index: number, value: string) => {
    setTempInputs(prev => prev.map((input, i) => i === index ? value : input))
  }, [])

  const updateOutput = useCallback((index: number, value: string) => {
    setTempOutputs(prev => prev.map((output, i) => i === index ? value : output))
  }, [])

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border-2 rounded-lg shadow-lg min-w-[250px] group",
      selected ? 'border-theme-green' : 'border-gray-200 dark:border-gray-600',
      nodeData.editable ? 'hover:border-theme-lightgreen' : ''
    )}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-theme-green"
      />
      
      {/* Process Header */}
      <div className="bg-blue-500 text-white p-3 rounded-t-lg">
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={tempProcessName}
                onChange={(e) => setTempProcessName(e.target.value)}
                className="h-6 text-sm bg-white text-black border-none p-1 flex-1"
                placeholder="Process name"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="h-6 w-6 p-0 text-white hover:bg-blue-400"
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
            <Textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              className="text-xs bg-white text-black border-none p-1 min-h-[40px]"
              placeholder="Process description"
            />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-sm">{processName}</h3>
              {description && (
                <p className="text-xs opacity-90 mt-1">{description}</p>
              )}
            </div>
            {nodeData.editable && selected && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-white hover:bg-blue-400"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Process Content */}
      <div className="p-3 space-y-3">
        {/* Inputs */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-3 w-3 text-green-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Inputs</span>
            {isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={addInput}
                className="h-4 w-4 p-0 text-green-500 hover:bg-green-50"
              >
                <Plus className="h-2 w-2" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {isEditing ? (
              tempInputs.map((input, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Input
                    value={input}
                    onChange={(e) => updateInput(index, e.target.value)}
                    className="h-5 text-xs flex-1"
                    placeholder="Input name"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeInput(index)}
                    className="h-4 w-4 p-0 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-2 w-2" />
                  </Button>
                </div>
              ))
            ) : (
              inputs.map((input, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 pl-2">
                  • {input}
                </div>
              ))
            )}
            {inputs.length === 0 && !isEditing && (
              <div className="text-xs text-gray-400 italic pl-2">No inputs</div>
            )}
          </div>
        </div>

        {/* Outputs */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeft className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Outputs</span>
            {isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={addOutput}
                className="h-4 w-4 p-0 text-blue-500 hover:bg-blue-50"
              >
                <Plus className="h-2 w-2" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {isEditing ? (
              tempOutputs.map((output, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Input
                    value={output}
                    onChange={(e) => updateOutput(index, e.target.value)}
                    className="h-5 text-xs flex-1"
                    placeholder="Output name"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeOutput(index)}
                    className="h-4 w-4 p-0 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-2 w-2" />
                  </Button>
                </div>
              ))
            ) : (
              outputs.map((output, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 pl-2">
                  • {output}
                </div>
              ))
            )}
            {outputs.length === 0 && !isEditing && (
              <div className="text-xs text-gray-400 italic pl-2">No outputs</div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-theme-green"
      />
    </div>
  )
}