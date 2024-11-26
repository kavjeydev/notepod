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
import Follow from "./follow";

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
    setActiveId(docId);
  };

  // Ref to store the latest handleMouseUp function
  const handleMouseUpRef = useRef<(event: MouseEvent) => void>();

  const handleMouseUp = (event: MouseEvent) => {
    event.stopPropagation();
    if (clickId && clickId !== hoverId) {
      onMoveFile(event);
    }
    setIsDragging(false);
    setHoverId(clickId);
    setClickId(undefined);
    setDragTitle("");

    setAutoScroll({ up: false, down: false, left: false, right: false });
  };

  // Assign the handleMouseUp to the ref
  useEffect(() => {
    handleMouseUpRef.current = handleMouseUp;
  }, [clickId, hoverId, isDragging, autoScroll]);

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

  useEffect(() => {
    // Function to handle global mouse up
    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (handleMouseUpRef.current) {
        handleMouseUpRef.current(event);
      }
    };

    // Function to handle global mouse move (if needed)
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        // Optionally, you can handle global mouse move here
        // For example, updating cursor position or auto-scrolling
        // But in this case, it's already handled by component's mouse move
        setHoverId(undefined);
      }
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("mousemove", handleGlobalMouseMove);
    } else {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging]);

  useEffect(() => {
    let animationFrameId: number;

    const scrollContainer = () => {
      if (isDragging) {
        if (containerRef.current) {
          if (autoScroll.up) {
            containerRef.current.scrollTop -= SCROLL_SPEED;
          }
          if (autoScroll.down) {
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

  const onMoveFile = (event: MouseEvent) => {
    event.stopPropagation();
    console.log(hoverId, typeof hoverId, hoverId === "outside");
    if (!clickId || clickId === hoverId) {
      return;
    }
    if (hoverId === "outside") {
      const promise = moveFile({ id: clickId, parentId: undefined });

      toast.promise(promise, {
        loading: "Moving Pod...",
        success: "Moved Pod!",
        error: "Failed to move Pod",
      });
    } else if (hoverId === undefined) {
      toast.error("Failed to move Pod");
    } else if (clickId) {
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
      <div
        className="flex flex-col overflow-y-auto h-[100%] pr-2 pl-2 "
        ref={containerRef}
        onMouseMove={(event) => {
          if (isDragging) {
            handleMouseMove(event, undefined);
          }
        }}
        // Remove onMouseUp from here
      >
        {documents.map((doc) => (
          <div key={doc._id}>
            {doc.isFolder ? (
              <div
                onMouseMove={(event) => handleMouseMove(event, doc._id)}
                onMouseDown={(event) => {
                  handleMouseDown(event, doc._id, doc.title);
                }}
                // Remove onMouseUp from here
              >
                {isDragging && <Follow title={dragTitle} />}

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
            ) : null}
          </div>
        ))}

        {documents.map((doc) => (
          <div key={`${doc._id}-file`}>
            {!doc.isFolder ? (
              <div
                onMouseMove={(event) => handleMouseMove(event, doc._id)}
                onMouseDown={(event) =>
                  handleMouseDown(event, doc._id, doc.title)
                }
                // Remove onMouseUp from here
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
            ) : null}
          </div>
        ))}

        {level === 0 ? (
          <div
            className={cn(
              "grow min-h-[25px] bg-[#FFFFFF] dark:bg-black",
              isDragging && "hover:dark:bg-[#363636] hover:bg-[#E5E5E5]",
            )}
            ref={outsideRef}
            onMouseMove={(event) => {
              if (isDragging) {
                handleMouseMove(event, "outside" as Id<"documents">);
              }

              if (!outsideRef.current) {
                return;
              }
            }}
            // Remove onMouseUp from here
          ></div>
        ) : null}
      </div>
    </>
  );
};
