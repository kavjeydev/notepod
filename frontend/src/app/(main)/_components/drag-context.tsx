import React, { createContext, ReactNode, useContext, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

interface DragProviderProps {
  children: ReactNode;
}

interface DragContextType {
  hoverId: Id<"documents"> | undefined;
  setHoverId: React.Dispatch<React.SetStateAction<Id<"documents"> | undefined>>;
  clickId: Id<"documents"> | undefined;
  setClickId: React.Dispatch<React.SetStateAction<Id<"documents"> | undefined>>;
  activeId: Id<"documents"> | undefined;
  setActiveId: React.Dispatch<
    React.SetStateAction<Id<"documents"> | undefined>
  >;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  dragTitle: string;
  setDragTitle: React.Dispatch<React.SetStateAction<string>>;
  cursorPosition: { x: number; y: number };
  setCursorPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
}
const DragContext = createContext<DragContextType | undefined>(undefined);

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error("useDragContext must be used within a DragProvider");
  }
  return context;
};

export const DragProvider: React.FC<DragProviderProps> = ({ children }) => {
  const [hoverId, setHoverId] = useState<Id<"documents"> | undefined>(
    undefined,
  );
  const [clickId, setClickId] = useState<Id<"documents"> | undefined>(
    undefined,
  );

  const [activeId, setActiveId] = useState<Id<"documents"> | undefined>(
    undefined,
  );

  const [isDragging, setIsDragging] = useState(false);
  const [dragTitle, setDragTitle] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  return (
    <DragContext.Provider
      value={{
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
      }}
    >
      {children}
    </DragContext.Provider>
  );
};
