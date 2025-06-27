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

import React from "react";
import { useEdgeStore } from "@/lib/edgestore";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
    const { edgestore } = useEdgeStore()

    const handleUpload = async (file:File) => {
        const response = await edgestore.publicFiles.upload({
            file
        })

        return response.url
    }
    
    const editor: BlockNoteEditor = useCreateBlockNote({
        editable,
        initialContent: initialContent ? (JSON.parse(initialContent) as PartialBlock[]) : undefined,
        uploadFile: editable ? handleUpload : undefined // Disable file upload in view mode
    });

    // Update editor editable state when prop changes
    React.useEffect(() => {
        if (editor) {
            editor.isEditable = editable;
        }
    }, [editor, editable]);

    return (
        <div className={editable ? "" : "pointer-events-none select-none"}>
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
    );
};

export default Editor;