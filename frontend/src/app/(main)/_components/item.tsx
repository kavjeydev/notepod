"use client";

import {
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash,
  FolderPlusIcon,
  FilePlus2,
  Pen,
} from "lucide-react";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { LargeNumberLike } from "crypto";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownItem } from "@nextui-org/react";
import { useUser } from "@clerk/clerk-react";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSortable } from "@dnd-kit/sortable";
import { UniqueIdentifier } from "@dnd-kit/core";
import Title from "./title";
import TitleDouble from "./title-double";
import { useRef, useState } from "react";

interface ItemProps {
  id?: Id<"documents">;
  id_str?: string;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  level?: number;
  isSearch?: boolean;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  icon?: LucideIcon;
  isFolder?: boolean;
  height: number;
  width: number;
}

export const Item = ({
  id,
  documentIcon,
  active,
  expanded,
  level = 0,
  isSearch,
  onExpand,
  label,
  onClick,
  icon: Icon,
  isFolder,
  height,
  width,
  id_str,
}: ItemProps) => {
  const createFile = useMutation(api.documents.createFile);
  const createFolder = useMutation(api.documents.createFolder);
  const router = useRouter();

  let document = undefined;

  if (id) {
    document = useQuery(api.documents.getById, {
      documentId: id,
    });
  }

  const update = useMutation(api.documents.update);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(document?.title || "untitled");

  const enableInput = () => {
    if (document?.title) {
      setTitle(document?.title);
    }

    setIsEditing(true);
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    if (document?._id) {
      update({
        id: document?._id,
        title: event.target.value || "untitled",
      });
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      disableInput();
    }
  };

  const handleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    if (!isEditing) {
      onExpand?.();
    }
  };

  const onCreateFile = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    if (!id) {
      return;
    }
    const promise = createFile({ title: "untitled", parentDocument: id }).then(
      (documentId) => {
        if (!expanded) {
          onExpand?.();
        }

        // router.push(`/documents/${documentId}`); # set up later
      },
    );

    toast.promise(promise, {
      loading: "Creating a new Pod...",
      success: "New Pod created!",
      error: "Failed to create new Pod",
    });
  };

  const onCreateFolder = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    if (!id) {
      return;
    }
    const promise = createFolder({
      title: "untitled",
      parentDocument: id,
    }).then((documentId) => {
      if (!expanded) {
        onExpand?.();
      }

      // router.push(`/documents/${documentId}`); # set up later
    });

    toast.promise(promise, {
      loading: "Creating a new folder...",
      success: "New folder created!",
      error: "Failed to create new folder",
    });
  };

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;
  const color = expanded ? "blue" : undefined;
  const { user } = useUser();

  const archive = useMutation(api.documents.archive);
  const onArchive = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;
    const promise = archive({ id });

    toast.promise(promise, {
      loading: "Deleting Pod...",
      success: "Pod moved to trash",
      error: "Failed to archive Pod",
    });
  };

  return (
    <div
      onClick={onClick}
      role="button"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
      className={cn(
        "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium select-none",
        active &&
          "bg-primary/15 text-primary border-neutral-400 border-1 dark:border-neutral-500",
        documentIcon && "ml-[-3px]",
      )}
    >
      {!!id && (
        <div
          role="button"
          className={`g-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1`}
          onClick={handleExpand}
        >
          {isFolder && (
            <ChevronIcon
              className={`h-4 w-4 shrink-0 text-muted-foreground/50 mr-[3px]`}
            />
          )}
        </div>
      )}
      {documentIcon ? (
        <div className="mr-[9px]">{documentIcon}</div>
      ) : (
        <div>
          {Icon ? (
            <Icon
              className="shrink-0 h-[18px] mr-[9px] text-muted-foreground"
              height={height}
              width={width}
            />
          ) : (
            <div className=""></div>
          )}
        </div>
      )}

      <span className="truncate">
        {!!document ? (
          <div
            onDoubleClick={enableInput}
            onBlur={disableInput}
            onChange={onChange}
            onKeyDown={onKeyDown}
          >
            <TitleDouble
              initialData={document as Doc<"documents">}
              isEditing={isEditing}
            />
          </div>
        ) : (
          <span className="truncate">{label}</span>
        )}
      </span>
      {isSearch && (
        <kbd
          className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded
        border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
      {!!id && (
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <div
                role="button"
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-full"
              align="start"
              side="right"
              forceMount
            >
              <DropdownMenuItem onClick={onArchive}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>

              <DropdownMenuItem onClick={enableInput}>
                <Pen className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="text-xs text-muted-foreground p-2">
                Last edited by: {user?.fullName}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {isFolder ? (
            <div className="flex gap-1">
              <div
                role="button"
                onClick={onCreateFile}
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                <FilePlus2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div
                role="button"
                onClick={onCreateFolder}
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                <FolderPlusIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  );
};

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{ paddingLeft: level ? `${level * 12 + 25}px` : "12px" }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-4 w-4 " />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  );
};
