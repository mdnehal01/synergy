"use client";

import {
  BlockNoteEditor,
  PartialBlock,
} from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

import "@blocknote/core/style.css";
import { useEdgeStore } from "@/lib/edgestore";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FlowCanvasWrapper } from "@/components/flow-editor/flow-canvas";
import { FileText, Workflow, Split, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedEditorWithFlowProps {
  onChange: (value: string) => void;
  onFlowChange?: (value: string) => void;
  initialContent?: string;
  initialFlowData?: string;
  editable?: boolean;
}

type ViewMode = 'editor' | 'flow' | 'split'

const EnhancedEditorWithFlow = ({ 
  onChange, 
  onFlowChange,
  initialContent, 
  initialFlowData,
  editable = true 
}: EnhancedEditorWithFlowProps) => {
    const { edgestore } = useEdgeStore()
    const [viewMode, setViewMode] = useState<ViewMode>('editor')

    const handleUpload = async (file: File) => {
        const response = await edgestore.publicFiles.upload({
            file
        })
        return response.url
    }
    
    const editor: BlockNoteEditor = useCreateBlockNote({
        initialContent: initialContent ? (JSON.parse(initialContent) as PartialBlock[]) : undefined,
        uploadFile: editable ? handleUpload : undefined
    });

    // Update editor editable state when prop changes
    React.useEffect(() => {
        if (editor) {
            editor.isEditable = editable;
        }
    }, [editor, editable]);

    const handleFlowDataChange = (flowData: string) => {
        if (onFlowChange) {
            onFlowChange(flowData)
        }
    }

    return (
        <div className="w-full">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-md p-1">
                    <Button
                        variant={viewMode === 'editor' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('editor')}
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
                        onClick={() => setViewMode('flow')}
                        className={cn(
                            "flex items-center gap-2 h-8",
                            viewMode === 'flow' && "bg-theme-green hover:bg-theme-lightgreen text-white"
                        )}
                    >
                        <Workflow className="h-4 w-4" />
                        Flow
                    </Button>
                    
                    <Button
                        variant={viewMode === 'split' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('split')}
                        className={cn(
                            "flex items-center gap-2 h-8",
                            viewMode === 'split' && "bg-theme-green hover:bg-theme-lightgreen text-white"
                        )}
                    >
                        <Split className="h-4 w-4" />
                        Split
                    </Button>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                    {viewMode === 'editor' && 'Text editing mode'}
                    {viewMode === 'flow' && 'Flow diagram mode'}
                    {viewMode === 'split' && 'Split view mode'}
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full">
                {viewMode === 'editor' && (
                    <div className="w-full">
                        <BlockNoteView
                            editor={editor}
                            editable={editable}
                            onChange={() => {
                                if (editable) {
                                    onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
                                }
                            }}
                        />
                    </div>
                )}

                {viewMode === 'flow' && (
                    <div className="w-full">
                        <FlowCanvasWrapper
                            initialData={initialFlowData}
                            onChange={handleFlowDataChange}
                            editable={editable}
                        />
                    </div>
                )}

                {viewMode === 'split' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                <FileText className="h-4 w-4 text-theme-green" />
                                <span className="text-sm font-medium">Text Editor</span>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                <BlockNoteView
                                    editor={editor}
                                    editable={editable}
                                    onChange={() => {
                                        if (editable) {
                                            onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                <Workflow className="h-4 w-4 text-theme-green" />
                                <span className="text-sm font-medium">Flow Diagram</span>
                            </div>
                            <div className="h-[500px]">
                                <FlowCanvasWrapper
                                    initialData={initialFlowData}
                                    onChange={handleFlowDataChange}
                                    editable={editable}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedEditorWithFlow;