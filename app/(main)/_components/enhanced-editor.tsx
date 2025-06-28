"use client";

import {
  BlockNoteEditor,
  PartialBlock,
  Block
} from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

import "@blocknote/core/style.css";

import React, { useCallback } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { ImageUploadModal } from "@/components/modals/image-upload-modal";

interface EnhancedEditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const EnhancedEditor = ({ onChange, initialContent, editable = true }: EnhancedEditorProps) => {
    const { edgestore } = useEdgeStore()
    const imageUpload = useImageUpload()

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

    const insertImage = useCallback((url: string) => {
        if (editor) {
            const imageBlock: PartialBlock = {
                type: "image",
                props: {
                    url: url,
                    caption: "",
                }
            };
            
            editor.insertBlocks([imageBlock], editor.getTextCursorPosition().block, "after");
        }
    }, [editor]);

    const handleImageUpload = () => {
        imageUpload.setOnImageSelect(insertImage);
        imageUpload.onOpen();
    };

    return (
        <div className={editable ? "" : "cursor-default"}>
            {editable && (
                <div className="mb-4 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleImageUpload}
                        className="flex items-center gap-2"
                    >
                        <ImageIcon className="h-4 w-4" />
                        Upload Image
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
            
            <ImageUploadModal
                isOpen={imageUpload.isOpen}
                onClose={imageUpload.onClose}
                onImageSelect={imageUpload.onImageSelect || (() => {})}
            />
        </div>
    );
};

export default EnhancedEditor;