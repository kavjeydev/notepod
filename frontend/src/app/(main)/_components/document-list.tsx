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
import { useDragContext } from "./drag-context";

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
  // const [activeId, setActiveId] = useState("");

  // const [clickId, setClickId] = useState<Id<"documents">>();
  const itemRef = useRef<ElementRef<"div">>(null);

  const {
    hoverId,
    setHoverId,
    clickId,
    setClickId,
    activeId,
    setActiveId,
    isDragging,
    setIsDragging,
    dragTitle,
    setDragTitle,
    cursorPosition,
    setCursorPosition,
  } = useDragContext();
  // const [hoverId, setHoverId] = useState<Id<"documents">>();
  const moveFile = useMutation(api.documents.moveFile);
  const isMovingRef = useRef(false);
  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    docId: Id<"documents">,
  ) => {
    event.stopPropagation();
    setHoverId(docId);
    setCursorPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    docId: Id<"documents">,
    docTitle: string,
  ) => {
    event.stopPropagation();
    setClickId(docId);
    setDragTitle(docTitle);
    setIsDragging(true);
  };

  const handleMouseUp = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    if (clickId && hoverId && clickId !== hoverId) {
      onMoveFile(event);
    }
    setIsDragging(false);
    setHoverId(undefined);
    setClickId(undefined);
    setDragTitle("");
  };

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: parentDocumentId,
  });

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  useEffect(() => {}, [clickId, hoverId]);

  const onMoveFile = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
        <div>
          {doc.isFolder ? (
            <div
              key={doc._id}
              onMouseMove={(event) => handleMouseMove(event, doc._id)}
              onMouseDown={(event) =>
                handleMouseDown(event, doc._id, doc.title)
              }
              onMouseUp={handleMouseUp}
            >
              <Item
                id={doc._id}
                onClick={
                  doc.isFolder
                    ? () => {
                        onExpand(doc._id);
                        setActiveId(doc._id);
                      }
                    : () => {
                        onRedirect(doc._id);
                        setActiveId(doc._id);
                      }
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
          ) : (
            <div></div>
          )}
        </div>
      ))}

      {documents.map((doc) => (
        <div>
          {!doc.isFolder ? (
            <div
              key={doc._id}
              onMouseMove={(event) => handleMouseMove(event, doc._id)}
              onMouseDown={(event) =>
                handleMouseDown(event, doc._id, doc.title)
              }
              onMouseUp={handleMouseUp}
            >
              <Item
                id={doc._id}
                onClick={
                  doc.isFolder
                    ? () => onExpand(doc._id)
                    : () => onRedirect(doc._id)
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
          ) : (
            <div></div>
          )}
        </div>
      ))}
    </>
  );
};
