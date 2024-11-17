import { Icon } from "../../../_components/ui/Icon";
import { EditorInfo } from "./EditorInfo";
import { EditorUser } from "../types";
import { WebSocketStatus } from "@hocuspocus/provider";
import { Toolbar } from "../../../_components/ui/Toolbar";
import { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";

export type EditorHeaderProps = {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  editor: Editor;
  collabState: WebSocketStatus;
  users: EditorUser[];
};

export const EditorHeader = ({
  editor,
  collabState,
  users,
  isSidebarOpen,
  toggleSidebar,
}: EditorHeaderProps) => {
  const { characters, words } = useEditorState({
    editor,
    selector: (ctx): { characters: number; words: number } => {
      const { characters, words } = ctx.editor?.storage.characterCount || {
        characters: () => 0,
        words: () => 0,
      };

      return { characters: characters(), words: words() };
    },
  });

  return (
    <div
      className="flex flex-row items-center flex-none text-
     bg-transparent dark:text-white"
    >
      <div className="">
        <div className="flex flex-row gap-x-1.5 items-center">
          <div className="flex items-center gap-x-1.5">
            <Toolbar.Button
              tooltip={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              onClick={toggleSidebar}
              active={isSidebarOpen}
              className={isSidebarOpen ? "bg-transparent" : ""}
            >
              <Icon name={isSidebarOpen ? "PanelLeftClose" : "PanelLeft"} />
            </Toolbar.Button>
          </div>
        </div>
      </div>
      <EditorInfo
        characters={characters}
        words={words}
        collabState={collabState}
        users={users}
      />
    </div>
  );
};
