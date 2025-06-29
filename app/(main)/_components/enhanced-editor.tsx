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
import React from "react";

interface EnhancedEditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const EnhancedEditor = ({ onChange, initialContent, editable = true }: EnhancedEditorProps) => {
    const { edgestore } = useEdgeStore()

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

    return (
            
            <BlockNoteView
                editor={editor}
                editable={editable}
                onChange={() => {
                    if (editable) {
                        onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
                    }
                }}
            />
    );
};

export default EnhancedEditor;