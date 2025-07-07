"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Item from "./Item";
import { FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentListProps{
    parentDocumentId?:Id<"documents">;
    level?:number;
    data?:Doc<"documents">;
    workspaceId?: Id<"workspaces">;
}

export const DocumentList:React.FC<DocumentListProps> = ({
    parentDocumentId,
    level=0,
    workspaceId
}) => {
    const params = useParams();
    const router = useRouter();
    const reorderDocuments = useMutation(api.documents.reorderDocuments);

    const [expanded, setExpanded] = useState<Record<string,boolean>>({})
    
    const onExpand = (documentId: string) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId]
        }))
    };

    // Use different queries based on context
    const documents = workspaceId 
    // eslint-disable-next-line
        ? useQuery(api.documents.getWorkspaceChildren, { 
            workspaceId, 
            parentDocument: parentDocumentId 
          })
          // eslint-disable-next-line
        : useQuery(api.documents.getsidebar, { parentDocument: parentDocumentId });

    const onRedirect = (documentId:string) => {
        if (workspaceId) {
            router.push(`/workspace/${workspaceId}/document/${documentId}`);
        } else {
            router.push(`/documents/${documentId}`);
        }
    };

    const handleReorder = async (
        documentId: Id<"documents">, 
        targetId: Id<"documents">, 
        position: "before" | "after"
    ) => {
        try {
            await reorderDocuments({
                documentId,
                targetDocumentId: targetId,
                position
            });
            toast.success("Document reordered successfully!");
        } catch (error) {
            toast.error("Failed to reorder document");
            console.error("Reorder error:", error);
        }
    };

    if(documents === undefined) {
        return (
            <>
                <Item.Skeleton level={level}/>
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level}/>
                        <Item.Skeleton level={level}/>
                    </>
                )}
            </>
        )
    }

    return (
        <>
            <p 
                style={{ paddingLeft: level ? `${(level * 12) + 25}px` : undefined }}
                className={cn(
                    "hidden text-sm font-medium text-white/80",
                    expanded && "last:block",
                    level === 0 && 'hidden'
                )}
            >
                No pages inside
            </p>
            {documents.map((document) => (
                <div key={document._id}>
                    <Item
                        id={document._id}
                        onclick={()=>onRedirect(document._id)}
                        label={document.title}
                        icon={<FileIcon size={12} className="mr-2"/>}
                        documentIcon={document.icon}
                        isActive={params.documentId === document._id}
                        level={level}
                        onExpand={()=>onExpand(document._id)}
                        expanded={expanded[document._id]}
                        parentDocument={parentDocumentId}
                        workspaceId={workspaceId}
                        onReorder={handleReorder}
                        showChevron={workspaceId ? true : undefined}
                    />
                    {expanded[document._id] && (
                        <DocumentList
                            parentDocumentId={document._id}
                            level={level+1}
                            workspaceId={workspaceId}
                        />
                    )}
                </div>
            ))}
        </>
    )
}