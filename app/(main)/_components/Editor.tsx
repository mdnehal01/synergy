"use client";

import {
  BlockNoteEditor,
  PartialBlock
} from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

import "@blocknote/core/style.css";

import React, { useCallback } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { AIGenerationModal } from "@/components/modals/ai-generation-modal";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
    const { edgestore } = useEdgeStore()
    const aiGeneration = useAIGeneration()

    const handleUpload = async (file: File) => {
        const response = await edgestore.publicFiles.upload({
            file
        })

        return response.url
    }
    
    const editor: BlockNoteEditor = useCreateBlockNote({
        initialContent: initialContent ? (JSON.parse(initialContent) as PartialBlock[]) : undefined,
        uploadFile: editable ? handleUpload : undefined // Enable file upload in edit mode
    });

    // Update editor editable state when prop changes
    React.useEffect(() => {
        if (editor) {
            editor.isEditable = editable;
        }
    }, [editor, editable]);

    const insertAIContent = useCallback((content: string) => {
        if (editor) {
            // Split content into paragraphs and create blocks
            const paragraphs = content.split('\n\n').filter(p => p.trim());
            
            const blocks: PartialBlock[] = paragraphs.map(paragraph => ({
                type: "paragraph",
                content: paragraph.trim()
            }));

            // Insert blocks at current cursor position
            const currentBlock = editor.getTextCursorPosition().block;
            editor.insertBlocks(blocks, currentBlock, "after");
        }
    }, [editor]);

    const handleAIGeneration = () => {
        aiGeneration.setOnContentGenerate(insertAIContent);
        aiGeneration.onOpen();
    };

    return (
        <div className={editable ? "" : "cursor-default"}>
            {editable && (
                <div className="mb-4 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAIGeneration}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
                        disabled={aiGeneration.isGenerating}
                    >
                        <Sparkles className="h-4 w-4" />
                        {aiGeneration.isGenerating ? "Generating..." : "AI Generate"}
                    </Button>
                </div>
            )}
            
            <BlockNoteView
                editor={editor}
                editable={editable}
                onChange={() => {
                    if (editable) {
                        onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
                    }
                }}
            />
            
            <AIGenerationModal
                isOpen={aiGeneration.isOpen}
                onClose={aiGeneration.onClose}
                onContentGenerate={aiGeneration.onContentGenerate || (() => {})}
                isGenerating={aiGeneration.isGenerating}
            />
        </div>
    );
};

export default Editor;