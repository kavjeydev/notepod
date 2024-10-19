"use client";

import { useParams, useRouter } from "next/navigation";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Item } from "./item";
import { cn } from "@/lib/utils";
import { FileIcon, FolderIcon } from "lucide-react";
import { toast } from "sonner";
import { Console } from "console";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

interface DocumentListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
}

export const DocumentList = ({
  parentDocumentId,
  level = 0,
}: DocumentListProps) => {
  const params = useParams();
  const router = useRouter();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState("");

  const [clickId, setClickId] = useState<Id<"documents">>();
  const itemRef = useRef<ElementRef<"div">>(null);
  const [hoverId, setHoverId] = useState<Id<"documents">>();
  const moveFile = useMutation(api.documents.moveFile);
  const isMovingRef = useRef(false);
  const handleMouseOver = (
    event: React.MouseEvent<HTMLDivElement>,
    docId: Id<"documents">,
  ) => {
    event.stopPropagation();
    setHoverId(docId);
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
    docId: Id<"documents">,
  ) => {
    event.stopPropagation();
    setClickId(docId);
  };

  const handleMouseUp = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    if (clickId && hoverId && clickId !== hoverId) {
      onMoveFile(event);
    }
    setHoverId(undefined);
    setClickId(undefined);
  };

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));

    setActiveId(documentId);
  };

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: parentDocumentId,
  });

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  useEffect(() => {
    console.log("Click:", clickId, "Hover:", hoverId);
  }, [clickId, hoverId]);

  const onMoveFile = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log("here");
    event.stopPropagation();
    if (clickId == "" || hoverId == "" || clickId == hoverId) {
      return;
    }
    if (clickId && hoverId) {
      const promise = moveFile({ id: clickId, parentId: hoverId });

      toast.promise(promise, {
        loading: "Moving Pod...",
        success: "Moved Pod!",
        error: "Failed to move Pod",
      });
    }
  };
  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }
  return (
    <>
      <p
        style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden",
        )}
      >
        No Pods inside
      </p>
      {documents.map((doc) => (
        <div
          key={doc._id}
          onMouseOver={(event) => handleMouseOver(event, doc._id)}
          onMouseDown={(event) => handleMouseDown(event, doc._id)}
          onMouseUp={handleMouseUp}
        >
          <Item
            id={doc._id}
            onClick={
              doc.isFolder ? () => onExpand(doc._id) : () => onRedirect(doc._id)
            }
            label={doc.title}
            icon={doc.isFolder ? undefined : FileIcon}
            documentIcon={doc.icon}
            active={activeId === doc._id}
            level={level}
            onExpand={() => onExpand(doc._id)}
            expanded={expanded[doc._id]}
            isFolder={doc.isFolder}
            height={10}
            width={10}
          />
          {expanded[doc._id] && (
            <DocumentList parentDocumentId={doc._id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  );
};
