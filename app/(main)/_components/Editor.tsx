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

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
    const { edgestore } = useEdgeStore()

    const handleUpload = async (file:File) => {
        const response = await edgestore.publicFiles.upload({
            file
        })

        return response.url
    }
    
    const editor: BlockNoteEditor = useCreateBlockNote({
        // @ts-expect-error err
        editable,
        initialContent: initialContent ? (JSON.parse(initialContent) as PartialBlock[]) : undefined,
        uploadFile:handleUpload 
    });


  return (
    <div>
      <BlockNoteView
        editor={editor}
        onChange={() => {
          onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
        }}
      />
    </div>
  );
};

export default Editor;
