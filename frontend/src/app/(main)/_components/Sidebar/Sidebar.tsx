import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { TableOfContents } from "../TableOfContents";

export const Sidebar = memo(
  ({
    editor,
    isOpen,
    onClose,
  }: {
    editor: Editor;
    isOpen?: boolean;
    onClose: () => void;
  }) => {
    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    }, [onClose]);

    const windowClassName = cn(
      "top-0 left-0 mr-4 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative z-[999] w-0 duration-300 transition-all",
      "dark:bg-black lg:dark:bg-darkbg overflow-y-scroll mb-12",
      !isOpen && "border-r-transparent",
      isOpen && "w-80 border-r border-r-neutral-200 dark:border-r-black",
    );

    return (
      <div className={windowClassName}>
        <div className="fixed w-full h-full">
          <div className="w-full h-full p-6">
            <TableOfContents
              onItemClick={handlePotentialClose}
              editor={editor}
            />
          </div>
        </div>
      </div>
    );
  },
);

Sidebar.displayName = "TableOfContentSidepanel";
