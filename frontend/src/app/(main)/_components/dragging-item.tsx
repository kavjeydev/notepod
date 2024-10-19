// DraggingItem.js
import React from "react";
import { useDragContext } from "./drag-context";

export const DraggingItem = () => {
  const { isDragging, dragTitle, cursorPosition } = useDragContext();

  if (!isDragging) return null;

  const style = {
    padding: "4px 8px",
    borderRadius: "4px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    zIndex: 1000,
  };
  console.log(cursorPosition.y + 5);
  return (
    <div
      className={`absolute top-[${cursorPosition.y + 5}px] left-[${cursorPosition.x + 5}px] pointer-events-none bg-cyan-300 border-r-4 shadow-md z-[1000]`}
    >
      {dragTitle}
    </div>
  );
};
