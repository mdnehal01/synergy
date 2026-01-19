"use client";

import {
  BlockNoteEditor,
  PartialBlock,
} from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, darkDefaultTheme, lightDefaultTheme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";

import React, { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useTextSelection } from "@/hooks/use-text-selection";
import { TextSelectionPopup } from "@/components/text-selection-popup";
import { FlowCanvasWrapper } from "@/components/flow-editor/flow-canvas";

interface EditorProps {
  onChange: (value: string) => void;
  onFlowChange?: (value: string) => void;
  initialContent?: string;
  initialFlowData?: string;
  editable?: boolean;
  showFlowEditor?: boolean;
  viewMode?: 'editor' | 'flow' | 'split';
  onViewModeChange?: (mode: 'editor' | 'flow' | 'split') => void;
}

const Editor = ({ 
  onChange, 
  onFlowChange,
  initialContent, 
  initialFlowData,
  editable = true,
  showFlowEditor = false,
  viewMode = 'editor',
  onViewModeChange
}: EditorProps) => {
  const { edgestore } = useEdgeStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [prompt, setPrompt] = useState("");
  const textSelection = useTextSelection();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent ? (JSON.parse(initialContent) as PartialBlock[]) : undefined,
    uploadFile: editable ? handleUpload : undefined,
  });

  React.useEffect(() => {
    if (editor) {
      editor.isEditable = editable;
    }
  }, [editor, editable]);

  const insertAIContent = useCallback(async (userPrompt: string) => {
    if (!userPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading("Generating content with Gemini...");

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userPrompt.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate content");
      }

      const data = await response.json();
      let blocks: PartialBlock[] = [];

      if (editor && data.content) {
        try {
          // Try parsing as BlockNote JSON
          const parsed = JSON.parse(data.content);
          if (Array.isArray(parsed)) {
            blocks = parsed as PartialBlock[];
          }
        } catch {
          // Fallback: parse markdown-like text into heading/paragraph blocks
          // @ts-expect-error abc
          const lines = data.content.split("\n").filter(line => line.trim());

          blocks = lines.map((line: string): PartialBlock => {
            if (line.startsWith("# ")) {
              return {
                type: "heading",
                props: { level: 1 },
                content: line.replace("# ", "").trim(),
              };
            } else if (line.startsWith("## ")) {
              return {
                type: "heading",
                props: { level: 2 },
                content: line.replace("## ", "").trim(),
              };
            } else {
              return {
                type: "paragraph",
                content: line.trim(), // this will keep **bold** as-is
              };
            }
          });
        }

        if (blocks.length === 0) {
          throw new Error("Generated content is empty.");
        }

        const currentBlock = editor.getTextCursorPosition().block;
        editor.insertBlocks(blocks, currentBlock, "after");
        toast.success("Content generated and inserted successfully!");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate content");
    } finally {
      setIsGenerating(false);
      toast.dismiss();
    }
  }, [editor]);

  const handleAIGeneration = () => {
    setShowPromptInput(true);
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      await insertAIContent(prompt);
      setPrompt("");
      setShowPromptInput(false);
    }
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit(e);
    } else if (e.key === "Escape") {
      setPrompt("");
      setShowPromptInput(false);
    }
  };

  const handleInsertText = (text: string) => {
    if (!editor) return;

    try {
      // Simply insert the text at the current cursor position
      editor.insertInlineContent([
        {
          type: "text",
          text: text,
          styles: {}
        }
      ]);
      
      // Don't show toast for each insertion - only show it when animation completes
    } catch (error) {
      console.error("Error inserting text:", error);
      toast.error("Failed to insert text");
    }
  };

  const handleFlowDataChange = (flowData: string) => {
    if (onFlowChange) {
      onFlowChange(flowData);
    }
  }
  const { resolvedTheme } = useTheme();
  const stored = typeof resolvedTheme === 'string' ? resolvedTheme : 'light';
  
  // Render based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'flow':
        return (
          <div className="w-full h-[600px]">
            <FlowCanvasWrapper
              initialData={initialFlowData}
              onChange={handleFlowDataChange}
              editable={editable}
            />
          </div>
        );
      
      case 'split':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Text Editor</span>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <BlockNoteView
                  theme={stored === 'dark' ? darkDefaultTheme : lightDefaultTheme}
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
                <span className="text-sm font-medium">Flow Canvas</span>
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
        );
      
      default: // 'editor'
        return (
          <div
            onMouseUp={() => {
              if (!editable) return;
              
              // Small delay to ensure selection is complete
              setTimeout(() => {
                const selection = window.getSelection();
                if (selection && selection.toString().trim()) {
                  const selectedText = selection.toString().trim();
                  const range = selection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  
                  // Position popup at the end of selection
                  const position = {
                    x: rect.right + 10,
                    y: rect.bottom + 10
                  };
                  
                  textSelection.onOpen(selectedText, position);
                }
              }, 100);
            }}
          >
            <BlockNoteView
              theme={stored === 'dark' ? darkDefaultTheme : lightDefaultTheme}
              editor={editor}
              editable={editable}
              onChange={() => {
                if (editable) {
                  onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
                }
              }}
            />
          </div>
        );
    }
  };

  return (
    <>
      <div className={editable ? "" : "cursor-default"}>
        {editable && (
          <div className="mb-4 space-y-2 px-14">
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIGeneration}
                className="flex items-center gap-2 bg-gradient-to-r hover:from-neutral-300 from-theme-green hover:to-neutral-400 to-theme-lightgreen text-white border-none"
                disabled={isGenerating || showPromptInput}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI Generate (Gemini)
                  </>
                )}
              </Button>
            </div>
            {showPromptInput && (
              <form onSubmit={handlePromptSubmit} className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handlePromptKeyDown}
                  placeholder="What would you like me to write? (Press Enter to generate, Esc to cancel)"
                  className="flex-1"
                  autoFocus
                  disabled={isGenerating}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!prompt.trim() || isGenerating}
                  className="bg-theme-green hover:bg-theme-lightgreen"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPrompt("");
                    setShowPromptInput(false);
                  }}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
              </form>
            )}
          </div>
        )}

        {renderContent()}
      </div>

      <TextSelectionPopup
        isOpen={textSelection.isOpen}
        selectedText={textSelection.selectedText}
        position={textSelection.position}
        onClose={textSelection.onClose}
        onInsertText={handleInsertText}
      />
    </>
  );
};

export default Editor;