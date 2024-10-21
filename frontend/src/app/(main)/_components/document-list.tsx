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
  const containerRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const SCROLL_THRESHOLD = 40; // pixels
  const SCROLL_SPEED = 8; // pixels per animation frame

  const outsideRef = useRef<ElementRef<"div">>(null);

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
    autoScroll,
    setAutoScroll,
  } = useDragContext();
  // const [hoverId, setHoverId] = useState<Id<"documents">>();
  const moveFile = useMutation(api.documents.moveFile);
  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    docId: Id<"documents"> | undefined,
  ) => {
    event.stopPropagation();
    setHoverId(docId);
    setCursorPosition({ x: event.clientX, y: event.clientY });

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const { top, bottom, left, right } = containerRect;

      const isNearTop = event.clientY - top <= SCROLL_THRESHOLD;
      const isNearBottom = bottom - event.clientY <= SCROLL_THRESHOLD;
      const isNearLeft = event.clientX - left <= SCROLL_THRESHOLD;
      const isNearRight = right - event.clientX <= SCROLL_THRESHOLD;
      console.log(autoScroll.up, autoScroll.down);
      setAutoScroll({
        up: isNearTop,
        down: isNearBottom,
        left: isNearLeft,
        right: isNearRight,
      });
    }
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    docId: Id<"documents"> | undefined,
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
    console.log(clickId, hoverId);
    if (clickId && clickId !== hoverId) {
      console.log("here");
      onMoveFile(event);
    }
    setIsDragging(false);
    setHoverId(clickId);
    setClickId(clickId);
    setDragTitle("");

    setAutoScroll({ up: false, down: false, left: false, right: false });
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

  useEffect(() => {
    let animationFrameId: number;

    const scrollContainer = () => {
      if (isDragging) {
        if (containerRef.current) {
          if (autoScroll.up) {
            console.log("erfiuheirfghrefiu woohoo");
            containerRef.current.scrollTop -= SCROLL_SPEED;
          }
          if (autoScroll.down) {
            console.log("erfiuheirfghrefiu woohoo");
            containerRef.current.scrollTop += SCROLL_SPEED;
          }
          if (autoScroll.left) {
            containerRef.current.scrollLeft -= SCROLL_SPEED;
          }
          if (autoScroll.right) {
            containerRef.current.scrollLeft += SCROLL_SPEED;
          }
        }

        // Continue scrolling if still dragging
        if (
          isDragging &&
          (autoScroll.up ||
            autoScroll.down ||
            autoScroll.left ||
            autoScroll.right)
        ) {
          animationFrameId = requestAnimationFrame(scrollContainer);
        }
      }
    };

    if (
      isDragging &&
      (autoScroll.up || autoScroll.down || autoScroll.left || autoScroll.right)
    ) {
      animationFrameId = requestAnimationFrame(scrollContainer);
    }

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [autoScroll, isDragging]);

  const onMoveFile = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!clickId || clickId == hoverId) {
      return;
    }
    if (clickId) {
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
      <>
        <p
          style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
          className={cn(
            "hidden text-sm font-medium text-muted-foreground/80",
            level === 0 && "hidden",
          )}
        >
          No Pods inside
        </p>
        <div
          className="flex flex-col overflow-y-auto h-[100%]"
          ref={containerRef}
          onMouseMove={(event) => {
            if (isDragging) {
              handleMouseMove(event, undefined);
            }
          }}
        >
          {documents.map((doc) => (
            <div>
              {doc.isFolder ? (
                <div
                  key={doc._id}
                  onMouseMove={(event) => handleMouseMove(event, doc._id)}
                  onMouseDown={(event) => {
                    handleMouseDown(event, doc._id, doc.title);
                    console.log();
                  }}
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
                    <DocumentList
                      parentDocumentId={doc._id}
                      level={level + 1}
                    />
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
                    <DocumentList
                      parentDocumentId={doc._id}
                      level={level + 1}
                    />
                  )}
                </div>
              ) : (
                <div></div>
              )}
            </div>
          ))}

          {level === 0 ? (
            <div
              className={cn(
                "grow min-h-[25px] bg-[#F5F5F5] dark:bg-[#262626]",
                isDragging && "hover:dark:bg-[#363636] hover:bg-[#E5E5E5]",
              )}
              ref={outsideRef}
              onMouseMove={(event) => {
                if (isDragging) {
                  handleMouseMove(event, undefined);
                }

                if (!outsideRef.current) {
                  return;
                }
              }}
              onMouseUp={(e) => {
                handleMouseUp(e);

                if (!outsideRef.current) {
                  return;
                }

                // outsideRef.current.style.backgroundColor = "#262626";
              }}
            ></div>
          ) : (
            <div></div>
          )}
        </div>
      </>
    </>
  );
};
