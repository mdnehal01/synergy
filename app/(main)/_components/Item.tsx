import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronRight, CommandIcon, GripVertical, Edit3, Copy, Scissors, ClipboardPaste, FileText, MoveUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { BiDotsHorizontal, BiPlus, BiTrash } from "react-icons/bi";
import { toast } from "sonner";
import { useClipboard } from "@/hooks/use-clipboard";
import { RenameModal } from "@/components/modals/rename-modal";

interface ItemProps {
  label: string;
  onclick?: () => void;
  icon: React.ReactNode;
  id?: Id<"documents">;
  documentIcon?: React.ReactNode;
  isActive?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  parentDocument?: Id<"documents">;
  workspaceId?: Id<"workspaces">;
  onReorder?: (documentId: Id<"documents">, targetId: Id<"documents">, position: "before" | "after") => void;
}

type ItemComponent = React.FC<ItemProps> & {
  Skeleton: React.FC<{ level?: number }>;
};

const Item: ItemComponent = ({
  label,
  onclick,
  icon,
  documentIcon,
  expanded,
  id,
  isActive,
  isSearch,
  level,
  onExpand,
  onReorder,
  parentDocument,
  workspaceId,
}) => {

  const router = useRouter();
  const create = useMutation(api.documents.create);
  const archive = useMutation(api.documents.archive);
  const duplicate = useMutation(api.documents.duplicate);
  const moveDocument = useMutation(api.documents.moveDocument);
  const makeParent = useMutation(api.documents.makeParent);
  const reorderDocuments = useMutation(api.documents.reorderDocuments);
  const { user } = useUser();
  const clipboard = useClipboard();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'child'>('before');
  const [showRenameModal, setShowRenameModal] = useState(false);

  // Query to check if this document has children
  const childDocuments = useQuery(api.documents.getsidebar, {
    parentDocument: id
  });

  const hasChildren = childDocuments && childDocuments.length > 0;
  const isChild = !!parentDocument; // Document is a child if it has a parent

  const handleExpand = (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    onExpand?.();
  }

  // Enhanced click handler that auto-expands children
  const handleItemClick = () => {
    // First, execute the original onclick function (navigation)
    if (onclick) {
      onclick();
    }
    
    // Then, if this item has children and is not currently expanded, expand it
    if (hasChildren && !expanded && onExpand) {
      onExpand();
    }
  };

  const ChevronIcon = expanded ? (
    <ChevronDown className="h-4 w-4 shrink-0 text-white group-hover:text-theme-blue transition-colors" />
  ) : (
    <ChevronRight className="h-4 w-4 shrink-0 text-white group-hover:text-theme-blue transition-colors" />
  );

  const onCreate = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if(!id) return;
    const promise = create({
      title:"Untitled",
      parentDocument: id,
      workspaceId: workspaceId
    })
    .then((documentId) => {
      if(!expanded) {
        onExpand?.();
      }
      
      // Navigate based on context
      if (workspaceId) {
        router.push(`/workspace/${workspaceId}/document/${documentId}`)
      } else {
        router.push(`/documents/${documentId}`)
      }

      toast.promise(promise, {
        loading:"Creating a note",
        success:"Note created successfully!",
        error:"Note creation failed "
      })
    })
  }

  const onArchive = (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    if(!id) return;
    const promise = archive({id})
  
    toast.promise(promise, {
      loading:"Moving to trash",
      success:"Note moved to trash!",
      error:"Failed to archive note"
    })
  }

  const onRename = (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    setShowRenameModal(true);
  }

  const onCopy = (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;
    
    clipboard.setItem({
      documentId: id,
      title: label,
      operation: 'copy',
      sourceParentId: parentDocument,
      workspaceId: workspaceId
    });
    
    toast.success("Document copied to clipboard");
  }

  const onCut = (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;
    
    clipboard.setItem({
      documentId: id,
      title: label,
      operation: 'cut',
      sourceParentId: parentDocument,
      workspaceId: workspaceId
    });
    
    toast.success("Document cut to clipboard");
  }

  const onPaste = async (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    if (!clipboard.item || !clipboard.canPaste(id, workspaceId)) return;

    try {
      if (clipboard.item.operation === 'copy') {
        // Duplicate the document
        const promise = duplicate({
          id: clipboard.item.documentId,
          targetParentId: id,
          targetWorkspaceId: workspaceId
        });
        
        toast.promise(promise, {
          loading: "Duplicating document...",
          success: "Document duplicated successfully!",
          error: "Failed to duplicate document"
        });
      } else if (clipboard.item.operation === 'cut') {
        // Move the document
        const promise = moveDocument({
          id: clipboard.item.documentId,
          targetParentId: id,
          targetWorkspaceId: workspaceId
        });
        
        toast.promise(promise, {
          loading: "Moving document...",
          success: "Document moved successfully!",
          error: "Failed to move document"
        });
        
        clipboard.clearItem(); // Clear clipboard after cut operation
      }
    } catch (error) {
      console.error("Paste operation failed:", error);
      toast.error("Failed to paste document");
    }
  }

  const onPasteAsParent = async (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    if (!clipboard.item || !clipboard.canPasteAsParent(id, parentDocument, workspaceId)) return;

    try {
      if (clipboard.item.operation === 'copy') {
        // Duplicate the document as a sibling (same parent as current document)
        const promise = duplicate({
          id: clipboard.item.documentId,
          targetParentId: parentDocument, // Same parent as current document
          targetWorkspaceId: workspaceId
        });
        
        toast.promise(promise, {
          loading: "Duplicating document as sibling...",
          success: "Document duplicated as sibling successfully!",
          error: "Failed to duplicate document as sibling"
        });
      } else if (clipboard.item.operation === 'cut') {
        // Move the document as a sibling (same parent as current document)
        const promise = moveDocument({
          id: clipboard.item.documentId,
          targetParentId: parentDocument, // Same parent as current document
          targetWorkspaceId: workspaceId
        });
        
        toast.promise(promise, {
          loading: "Moving document as sibling...",
          success: "Document moved as sibling successfully!",
          error: "Failed to move document as sibling"
        });
        
        clipboard.clearItem(); // Clear clipboard after cut operation
      }
    } catch (error) {
      console.error("Paste as parent operation failed:", error);
      toast.error("Failed to paste document as sibling");
    }
  }

  const onMakeParent = async (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;

    try {
      const promise = makeParent({ id });
      
      toast.promise(promise, {
        loading: "Making document a parent...",
        success: "Document moved to top level successfully!",
        error: "Failed to make document a parent"
      });
    } catch (error) {
      console.error("Make parent operation failed:", error);
      toast.error("Failed to make document a parent");
    }
  }

  // Enhanced Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!id || isSearch) return;
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.setData("application/json", JSON.stringify({
      documentId: id,
      workspaceId: workspaceId,
      parentDocument: parentDocument
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!id || isSearch) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);

    // Calculate drop position based on mouse position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // Divide the item into three zones
    if (y < height * 0.25) {
      setDragPosition('before');
    } else if (y > height * 0.75) {
      setDragPosition('after');
    } else {
      setDragPosition('child');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only remove drag over if we're actually leaving the element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOver(false);
      setDragPosition('before');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (!id || isSearch) return;
    
    const draggedId = e.dataTransfer.getData("text/plain") as Id<"documents">;
    if (draggedId === id) return;

    try {
      let dragData;
      try {
        dragData = JSON.parse(e.dataTransfer.getData("application/json"));
      } catch {
        // Fallback for simple drag operations
        dragData = { documentId: draggedId };
      }

      if (dragPosition === 'child') {
        // Make the dragged document a child of this document
        const promise = moveDocument({
          id: draggedId,
          targetParentId: id,
          targetWorkspaceId: workspaceId
        });
        
        toast.promise(promise, {
          loading: "Moving document as child...",
          success: "Document moved as child successfully!",
          error: "Failed to move document as child"
        });

        // Auto-expand to show the new child
        if (!expanded && onExpand) {
          onExpand();
        }
      } else if (dragPosition === 'before' || dragPosition === 'after') {
        // Check if the dragged document has the same parent and workspace context as the target
        const draggedParent = dragData.parentDocument;
        const draggedWorkspace = dragData.workspaceId;
        
        const sameParent = draggedParent === parentDocument;
        const sameWorkspace = draggedWorkspace === workspaceId;
        
        if (sameParent && sameWorkspace) {
          // Same context - use reorderDocuments for proper sibling reordering
          if (onReorder) {
            onReorder(draggedId, id, dragPosition);
          } else {
            // Fallback to reorderDocuments mutation directly
            const promise = reorderDocuments({
              documentId: draggedId,
              targetDocumentId: id,
              position: dragPosition
            });
            
            toast.promise(promise, {
              loading: "Reordering document...",
              success: "Document reordered successfully!",
              error: "Failed to reorder document"
            });
          }
        } else {
          // Different context - use moveDocument to change parent/workspace
          const promise = moveDocument({
            id: draggedId,
            targetParentId: parentDocument,
            targetWorkspaceId: workspaceId
          });
          
          toast.promise(promise, {
            loading: "Moving document...",
            success: "Document moved successfully!",
            error: "Failed to move document"
          });
        }
      }
    } catch (error) {
      console.error("Drop operation failed:", error);
      toast.error("Failed to move document");
    } finally {
      setDragPosition('before');
    }
  };

  // Get drag indicator styles
  const getDragIndicatorStyles = () => {
    if (!dragOver) return {};
    
    switch (dragPosition) {
      case 'before':
        return {
          borderTop: '2px solid #01FF5A',
          backgroundColor: 'rgba(1, 255, 90, 0.1)'
        };
      case 'after':
        return {
          borderBottom: '2px solid #01FF5A',
          backgroundColor: 'rgba(1, 255, 90, 0.1)'
        };
      case 'child':
        return {
          backgroundColor: 'rgba(1, 255, 90, 0.2)',
          border: '2px dashed #01FF5A'
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div
        role="button"
        style={{ 
          paddingLeft: level ? `${(level * 12) + 12}px` : "12px",
          ...getDragIndicatorStyles()
        }}
        className={cn(
          "group min-h-[27px] py-1 pr-3 text-sm w-full transition-all duration-200 flex items-center text-white font-medium relative",
          "hover:bg-theme-lightgreen/20 hover:text-theme-green hover:shadow-sm hover:bg-white",
          isActive && "bg-white text-theme-green",
          isDragging && "opacity-50 scale-105"
        )}
        onClick={handleItemClick}
        draggable={!!id && !isSearch}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag handle - only show for documents that can be dragged */}
        {!!id && !isSearch && (
          <div 
            className="opacity-0 group-hover:opacity-100 mr-1 cursor-grab active:cursor-grabbing transition-opacity"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3 w-3 text-theme-green transition-colors" />
          </div>
        )}

        {/* Always render the chevron container div to maintain consistent spacing */}
        <div className="w-4 h-full flex items-center justify-center mr-1 shrink-0">
          {!!id && hasChildren && (
            <div
              role="button"
              onClick={handleExpand}
              className="h-full w-full rounded-sm hover:bg-neutral-200 flex items-center justify-center transition-colors"
            >
              {ChevronIcon}
            </div>
          )}
        </div>

        <div className="mr-2 flex items-center justify-center shrink-0 group-hover:text-theme-green transition-colors">
          {documentIcon || icon}
        </div>
        <span className="truncate group-hover:text-theme-green transition-colors">{label}</span>

        {/* Drop position indicator */}
        {dragOver && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-theme-green text-white px-2 py-1 rounded z-10">
            {dragPosition === 'child' ? 'Drop as child' : 
             dragPosition === 'before' ? 'Drop before' : 'Drop after'}
          </div>
        )}

        {isSearch && (
          <kbd className="ml-auto pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-theme-lightgreen px-1.5 font-mono text-[10px] font-medium text-black opacity-100 group-hover:bg-theme-green group-hover:text-white transition-colors">
            <span className="text-xs">
              <CommandIcon size={10} />
            </span>
            K
          </kbd>
        )}

        {!!id && (
          <div className="ml-auto flex gap-x-2 items-center">
             <div 
               role="button" 
               onClick={onCreate} 
               className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-theme-green/20 hover:text-theme-lightgreen p-1 transition-all"
             >
              <BiPlus className="text-white group-hover:text-theme-lightgreen transition-colors"/> 
             </div>

             <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => {
                e.stopPropagation();
              }} asChild>
                <div 
                  role="button" 
                  className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-theme-green/20 hover:text-theme-lightgreen p-1 transition-all"
                >
                  <BiDotsHorizontal size={15} className="text-white group-hover:text-theme-lightgreen transition-colors"/>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="start" side="right" forceMount>
                <DropdownMenuItem onClick={onRename} className="hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors">
                  <Edit3 className="mr-2 h-4 w-4"/>
                  Rename
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={onCreate} className="hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors">
                  <FileText className="mr-2 h-4 w-4"/>
                  Add child page
                </DropdownMenuItem>
                
                {/* Show "Make as parent" option only for child documents */}
                {isChild && (
                  <DropdownMenuItem onClick={onMakeParent} className="hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors">
                    <MoveUp className="mr-2 h-4 w-4"/>
                    Make as parent
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator/>
                
                <DropdownMenuItem onClick={onCopy} className="hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors">
                  <Copy className="mr-2 h-4 w-4"/>
                  Copy
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={onCut} className="hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors">
                  <Scissors className="mr-2 h-4 w-4"/>
                  Cut
                </DropdownMenuItem>
                
                {clipboard.canPaste(id, workspaceId) && (
                  <DropdownMenuItem onClick={onPaste} className="hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors">
                    <ClipboardPaste className="mr-2 h-4 w-4"/>
                    Paste as child ({clipboard.item?.operation === 'copy' ? 'Copy' : 'Move'})
                  </DropdownMenuItem>
                )}

                {clipboard.canPasteAsParent(id, parentDocument, workspaceId) && (
                  <DropdownMenuItem onClick={onPasteAsParent} className="hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors">
                    <Users className="mr-2 h-4 w-4"/>
                    Paste as sibling ({clipboard.item?.operation === 'copy' ? 'Copy' : 'Move'})
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator/>
                
                <DropdownMenuItem onClick={onArchive} className="hover:bg-red-50 hover:text-red-600 transition-colors">
                  <BiTrash className="mr-2 h-4 w-4"/>
                  Delete
                </DropdownMenuItem>
                
                <DropdownMenuSeparator/>
                <div className="text-xs text-theme-blue p-2 ">Last edited by: {user?.fullName}</div>
              </DropdownMenuContent>
             </DropdownMenu>
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {id && (
        <RenameModal
          isOpen={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          documentId={id}
          currentTitle={label}
        />
      )}
    </>
  );
};

// ✅ Add the Skeleton as a static property
Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      className="flex items-center gap-2 py-1 animate-pulse"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
    >
      <Skeleton className="h-4 w-4 bg-theme-lightgreen" />
      <Skeleton className="h-4 w-[60%] bg-theme-lightgreen" />
    </div>
  );
};

export default Item;