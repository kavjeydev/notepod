import { EditorContent } from "@tiptap/react";
import React, { useRef } from "react";

import { LinkMenu } from "../menus";

import { useBlockEditor } from "../../hooks/useBlockEditor";

import "../../styles/index.css";

import { Sidebar } from "../Sidebar";
import ImageBlockMenu from "../../extensions/ImageBlock/components/ImageBlockMenu";
import { ColumnsMenu } from "../../extensions/MultiColumn/menus";
import { TableColumnMenu, TableRowMenu } from "../../extensions/Table/menus";
import { EditorHeader } from "./components/EditorHeader";
import { TextMenu } from "../menus/TextMenu";
import { ContentItemMenu } from "../menus/ContentItemMenu";
import { useSidebar } from "../../hooks/useSidebar";
import * as Y from "yjs";
import { TiptapCollabProvider } from "@hocuspocus/provider";
import { update } from "../../../../../convex/documents";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export const BlockEditor = ({
  aiToken,
  ydoc,
  provider,
  docId,
  editable,
  previewMode,
}: {
  aiToken?: string;
  hasCollab: boolean;
  ydoc: Y.Doc;
  provider?: TiptapCollabProvider | null | undefined;
  docId: Id<"documents">;
  editable: boolean;
  previewMode: boolean;
}) => {
  const menuContainerRef = useRef(null);

  const leftSidebar = useSidebar();
  const { editor, users, collabState } = useBlockEditor({
    aiToken,
    ydoc,
    provider,
    docId,
    editable,
  });

  if (!editor || !users) {
    return null;
  }
  const update = useMutation(api.documents.update);
  const document = useQuery(api.documents.getById, {
    documentId: docId,
  });

  const onChange = (content: string) => [
    update({
      id: docId,
      content,
    }),
  ];

  return (
    <div
      className={`relative ${previewMode ? "top-0" : "top-12"} flex h-full w-full mb-20 `}
      ref={menuContainerRef}
    >
      <div className="fixed flex h-full z-[999] ">
        {/* <div
        className="relative flex h-full w-full overflow-y-scroll"
        ref={menuContainerRef}
      > */}
        <Sidebar
          isOpen={leftSidebar.isOpen}
          onClose={leftSidebar.close}
          editor={editor}
        />
      </div>
      {/* </div> */}

      <div
        className={`fixed w-full h-16 mb-2 p-3 z-[999] transition-all
          duration-300 ease-in-out
          ${previewMode && "top-0"}
          ${leftSidebar.isOpen ? "ml-80 dark:bg-[#121212] bg-default-100" : "ml-0 bg-transparent"}`}
      >
        <EditorHeader
          editor={editor}
          collabState={collabState}
          users={users}
          isSidebarOpen={leftSidebar.isOpen}
          toggleSidebar={leftSidebar.toggle}
        />
      </div>

      <div
        className={`relative flex flex-col flex-1 h-full w-[50vw]
           ${leftSidebar.isOpen ? "ml-64 mt-4" : "ml-0"} transition-all
          duration-300 ease-in-out`}
      >
        <EditorContent
          editor={editor}
          className="flex-1 overflow-y-auto"
          content={document?.content}
          onInput={() => {
            onChange(editor.getHTML());
          }}
          onBlur={() => {
            onChange(editor.getHTML());
          }}
        />
        {editable && <ContentItemMenu editor={editor} />}

        <LinkMenu editor={editor} appendTo={menuContainerRef} />

        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
        {/* <Sidebar
          isOpen={leftSidebar.isOpen}
          onClose={leftSidebar.close}
          editor={editor}
        /> */}
      </div>
    </div>
  );
};

export default BlockEditor;
