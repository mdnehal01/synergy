"use client"

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  BackgroundVariant,
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
  NodeTypes,
  EdgeTypes
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Square, 
  Circle, 
  Diamond, 
  Type, 
  Image as ImageIcon,
  Trash2,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  Database,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { CustomTextNode } from './nodes/custom-text-node'
import { CustomShapeNode } from './nodes/custom-shape-node'
import { CustomImageNode } from './nodes/custom-image-node'
import { ERDiagramNode } from './nodes/er-diagram-node'
import { ProcessNode } from './nodes/process-node'
import { CustomEdge } from './edges/custom-edge'

const nodeTypes = {
  customText: CustomTextNode,
  customShape: CustomShapeNode,
  customImage: CustomImageNode,
  erDiagram: ERDiagramNode,
  processNode: ProcessNode,
} as NodeTypes

const edgeTypes = {
  custom: CustomEdge,
} as EdgeTypes

interface FlowCanvasProps {
  initialData?: string
  onChange?: (data: string) => void
  editable?: boolean
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({ 
  initialData, 
  onChange, 
  editable = true 
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [selectedNodeType, setSelectedNodeType] = useState<'text' | 'rectangle' | 'circle' | 'diamond' | 'image'>('text')

  // Load initial data
  useEffect(() => {
    if (initialData) {
      try {
        const flowData = JSON.parse(initialData)
        if (flowData.nodes) setNodes(flowData.nodes)
        if (flowData.edges) setEdges(flowData.edges)
      } catch (error) {
        console.error('Error parsing flow data:', error)
      }
    }
  }, [initialData, setNodes, setEdges])

  // Save data when nodes or edges change
  useEffect(() => {
    if (onChange && (nodes.length > 0 || edges.length > 0)) {
      const flowData = {
        nodes,
        edges,
        viewport: reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 }
      }
      onChange(JSON.stringify(flowData))
    }
  }, [nodes, edges, onChange, reactFlowInstance])

  const onConnect = useCallback(
    (params: Connection) => {
      if (!editable) return
      setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds))
    },
    [setEdges, editable]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (!editable) return
      
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds || !reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: getNodeType(type),
        position,
        data: getNodeData(type),
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes, editable]
  )

  const getNodeType = (type: string) => {
    switch (type) {
      case 'text': return 'customText'
      case 'image': return 'customImage'
      default: return 'customShape'
    }
  }

  const getNodeData = (type: string) => {
    switch (type) {
      case 'text':
        return { label: 'New Text', editable }
      case 'rectangle':
        return { shape: 'rectangle', label: 'Rectangle', editable }
      case 'circle':
        return { shape: 'circle', label: 'Circle', editable }
      case 'diamond':
        return { shape: 'diamond', label: 'Diamond', editable }
      case 'image':
        return { src: '', alt: 'Image', editable }
      case 'entity':
        return { 
          entityName: 'Entity', 
          attributes: [{ name: 'id', type: 'int', isPrimaryKey: true }], 
          editable 
        }
      case 'process':
        return { 
          processName: 'Process', 
          description: 'Process description', 
          inputs: ['Input'], 
          outputs: ['Output'], 
          editable 
        }
      default:
        return { label: 'Node', editable }
    }
  }

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const addNode = (type: string) => {
    if (!editable) return
    
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: getNodeType(type),
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: getNodeData(type),
    }
    setNodes((nds) => nds.concat(newNode))
  }

  const clearCanvas = () => {
    if (!editable) return
    setNodes([])
    setEdges([])
    toast.success('Canvas cleared')
  }

  const exportFlow = () => {
    const flowData = {
      nodes,
      edges,
      viewport: reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 }
    }
    
    const dataStr = JSON.stringify(flowData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `flow-${Date.now()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Flow exported successfully')
  }

  const importFlow = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editable) return
    
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target?.result as string)
        if (flowData.nodes) setNodes(flowData.nodes)
        if (flowData.edges) setEdges(flowData.edges)
        if (flowData.viewport && reactFlowInstance) {
          reactFlowInstance.setViewport(flowData.viewport)
        }
        toast.success('Flow imported successfully')
      } catch (error) {
        toast.error('Error importing flow')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
  }

  const fitView = () => {
    reactFlowInstance?.fitView()
  }

  const zoomIn = () => {
    reactFlowInstance?.zoomIn()
  }

  const zoomOut = () => {
    reactFlowInstance?.zoomOut()
  }

  return (
    <div className="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <ReactFlow
        ref={reactFlowWrapper}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={editable}
      >
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={editable}
        />
        <MiniMap 
          nodeStrokeColor="#374151"
          nodeColor="#f3f4f6"
          nodeBorderRadius={2}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        
        {editable && (
          <Panel position="top-left" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Basic Elements
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-8"
                  onDragStart={(event) => onDragStart(event, 'text')}
                  onClick={() => addNode('text')}
                  draggable
                >
                  <Type className="h-3 w-3" />
                  Text
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-8"
                  onDragStart={(event) => onDragStart(event, 'rectangle')}
                  onClick={() => addNode('rectangle')}
                  draggable
                >
                  <Square className="h-3 w-3" />
                  Box
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-8"
                  onDragStart={(event) => onDragStart(event, 'circle')}
                  onClick={() => addNode('circle')}
                  draggable
                >
                  <Circle className="h-3 w-3" />
                  Circle
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-8"
                  onDragStart={(event) => onDragStart(event, 'diamond')}
                  onClick={() => addNode('diamond')}
                  draggable
                >
                  <Diamond className="h-3 w-3" />
                  Diamond
                </Button>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diagram Elements
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-8"
                    onDragStart={(event) => onDragStart(event, 'entity')}
                    onClick={() => addNode('entity')}
                    draggable
                  >
                    <Database className="h-3 w-3" />
                    ER Entity
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-8"
                    onDragStart={(event) => onDragStart(event, 'process')}
                    onClick={() => addNode('process')}
                    draggable
                  >
                    <Zap className="h-3 w-3" />
                    Process
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCanvas}
                    className="flex items-center gap-1 h-8 flex-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportFlow}
                    className="flex items-center gap-1 h-8 flex-1"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                </div>
                
                <div className="mt-1">
                  <label className="block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importFlow}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 h-8 w-full"
                      asChild
                    >
                      <span>
                        <Upload className="h-3 w-3" />
                        Import
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </Panel>
        )}
        
        <Panel position="top-right" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fitView}
              className="h-8 w-8 p-0"
            >
              <Maximize className="h-3 w-3" />
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export const FlowCanvasWrapper: React.FC<FlowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  )
}