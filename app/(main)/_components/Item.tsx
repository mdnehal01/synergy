import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronRight, CommandIcon, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { BiDotsHorizontal, BiPlus, BiTrash } from "react-icons/bi";
import { toast } from "sonner";

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
  onReorder?: (documentId: Id<"documents">, newOrder: number) => void;
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
  parentDocument,
  onReorder,
}) => {

  const router = useRouter();
  const create = useMutation(api.documents.create );
  const archive = useMutation(api.documents.archive);
  const { user } = useUser();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Query to check if this document has children
  const childDocuments = useQuery(api.documents.getsidebar, {
    parentDocument: id
  });

  const hasChildren = childDocuments && childDocuments.length > 0;

  const handleExpand = (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    onExpand?.();
  }

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
      parentDocument: id
    })
    .then((documentId) => {
      if(!expanded) {
        onExpand?.();
      }
      router.push(`/documents/${documentId}`)

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

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!id) return;
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const draggedId = e.dataTransfer.getData("text/plain") as Id<"documents">;
    if (!id || draggedId === id || !onReorder) return;

    // Find the current position of the dropped item
    const currentElement = e.currentTarget as HTMLElement;
    const rect = currentElement.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const dropPosition = e.clientY < midpoint ? 0 : 1;

    // Get the index of the current item and calculate new position
    const parentElement = currentElement.parentElement;
    if (!parentElement) return;

    const allItems = Array.from(parentElement.children);
    const currentIndex = allItems.indexOf(currentElement);
    const newIndex = currentIndex + dropPosition;

    onReorder(draggedId, newIndex);
  };

  return (
    <div
      role="button"
      style={{ paddingLeft: level ? `${(level * 12) + 12}px` : "12px" }}
      className={cn(
        "group min-h-[27px] py-1 pr-3 text-sm w-full transition-all duration-200 flex items-center text-white font-medium relative",
        "hover:bg-theme-lightgreen/20 hover:text-theme-green hover:shadow-sm hover:bg-white",
        isActive && "bg-theme-lightgreen/30 text-theme-lightgreen border-l-2 border-theme-lightgreen",
        isDragging && "opacity-50",
        dragOver && "bg-theme-lightgreen/40 border-t-2 border-theme-lightgreen"
      )}
      onClick={onclick}
      draggable={!!id && !isSearch}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag handle - only show for documents that can be dragged */}
      {!!id && !isSearch && (
        <div className="opacity-0 group-hover:opacity-100 mr-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3 text-white/50 hover:text-theme-lightgreen transition-colors" />
        </div>
      )}

      {/* Always render the chevron container div to maintain consistent spacing */}
      <div className="w-4 h-full flex items-center justify-center mr-1 shrink-0">
        {!!id && hasChildren && (
          <div
            role="button"
            onClick={handleExpand}
            className="h-full w-full rounded-sm hover:bg-theme-lightgreen/30 hover:text-theme-blue flex items-center justify-center transition-colors"
          >
            {ChevronIcon}
          </div>
        )}
      </div>

      <div className="mr-2 flex items-center justify-center shrink-0 group-hover:text-theme-green transition-colors">
        {documentIcon || icon}
      </div>
      <span className="truncate group-hover:text-theme-green transition-colors">{label}</span>

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
              <DropdownMenuItem onClick={onArchive} className="hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors">
                <BiTrash className="mr-2"/>
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator/>
              <div className="text-xs text-theme-blue p-2 ">Last edited by: {user?.fullName}</div>
            </DropdownMenuContent>
           </DropdownMenu>
        </div>
      )}
    </div> 
  );
};

// ✅ Add the Skeleton as a static property
Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      className="flex items-center gap-2 py-1 animate-pulse"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
    >
      <Skeleton className="h-4 w-4 bg-theme-lightgreen/20" />
      <Skeleton className="h-4 w-[30%] bg-theme-lightgreen/20" />
    </div>
  );
};

export default Item;