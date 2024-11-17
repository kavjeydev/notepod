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
}: {
  aiToken?: string;
  hasCollab: boolean;
  ydoc: Y.Doc;
  provider?: TiptapCollabProvider | null | undefined;
  docId: Id<"documents">;
  editable: boolean;
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
      className="relative top-12 flex h-full w-full mb-20"
      ref={menuContainerRef}
    >
      {/* <div
        className="fixed flex h-full w-full mb-20 pr-20 ml"
        ref={menuContainerRef}
      > */}
      <Sidebar
        isOpen={leftSidebar.isOpen}
        onClose={leftSidebar.close}
        editor={editor}
      />
      {/* </div> */}

      <div className="fixed bottom-8 right-2 bg-transparent z-[99999]">
        <EditorHeader
          editor={editor}
          collabState={collabState}
          users={users}
          isSidebarOpen={leftSidebar.isOpen}
          toggleSidebar={leftSidebar.toggle}
        />
      </div>

      <div className="relative flex flex-col flex-1 h-full w-[50vw] overflow-visible">
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
