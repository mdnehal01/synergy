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

import React, { useCallback, useState } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useTextSelection } from "@/hooks/use-text-selection";
import { TextSelectionPopup } from "@/components/text-selection-popup";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
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
      // Get the current selection info
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const selectedText = selection.toString();
        
        // Clear the selection and position cursor at the end
        selection.collapseToEnd();
        
        // Insert the original selected text + generated content
        editor.insertInlineContent([
          {
            type: "text",
            text: selectedText + text.trim(), // Combine original + generated
            styles: {}
          }
        ]);
      } else {
        // If no selection, just insert the generated text
        editor.insertInlineContent([
          {
            type: "text",
            text: text.trim(),
            styles: {}
          }
        ]);
      }
      
      toast.success("Text inserted successfully!");
    } catch (error) {
      console.error("Error inserting text:", error);
      toast.error("Failed to insert text");
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