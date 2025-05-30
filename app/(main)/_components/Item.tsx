import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { ChevronDown, ChevronRight, CommandIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { BiPlus } from "react-icons/bi";
import { toast } from "sonner";

interface ItemProps {
  label: string;
  onclick: () => void;
  icon: React.ReactNode;
  id?: Id<"documents">;
  documentIcon?: React.ReactNode;
  isActive?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
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
}) => {

  const router = useRouter();
  const create = useMutation(api.documents.create );

  const handleExpand = (event: React.MouseEvent<HTMLDivElement,MouseEvent>) => {
    event.stopPropagation();
    onExpand?.();
  }

  const ChevronIcon = expanded ? (
    <ChevronDown className="h-4 w-4 shrink-0 text-white" />
  ) : (
    <ChevronRight className="h-4 w-4 shrink-0 text-white" />
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
      // router.push(`/documents/${documentId}`)

      toast.promise(promise, {
        loading:"Creating a note",
        success:"Note created successfully!",
        error:"Note creation failed "
      })
    })
  }

  return (
    <div
      role="button"
      style={{ paddingLeft: level ? `${(level * 12) + 12}px` : "12px" }}
      className={cn(
        "group min-h-[27px] py-1 pr-3 text-sm w-full hover:bg-theme-lightgreen/30 flex items-center text-white font-medium",
        isActive && "bg-theme-lightgreen/30 text-theme-lightgreen"
      )}
      onClick={onclick}
    >
      {!!id && (
        <div
          role="button"
          onClick={handleExpand}
          className="h-full rounded-sm hover:bg-theme-blue/20 hover:text-white mr-1"
        >
          {ChevronIcon}
        </div>
      )}

      <div>{documentIcon || icon}</div>
      <span className="truncate">{label}</span>

      {isSearch && (
        <kbd className="ml-auto pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-theme-lightgreen px-1.5 font-mono text-[10px] font-medium text-black opacity-100">
          <span className="text-xs">
            <CommandIcon size={10} />
          </span>
          K
        </kbd>
      )}

      {!!id && (
        <div className="ml-auto flex gap-x-2 items-center">
           <div role="button" onClick={onCreate} className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-theme-blue/20">
            <BiPlus/> 
           </div>
        </div>
      )}
    </div> 
  );
};

// ✅ Add the Skeleton as a static property
Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      className="flex items-center gap-2 py-1"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  );
};

export default Item;
