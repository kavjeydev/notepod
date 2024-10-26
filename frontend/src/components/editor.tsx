"use client";
import styles from "./editor.module.scss";

import CodeBlock from "@tiptap/extension-code-block";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

import { Heading } from "@tiptap/extension-heading";
import { Code } from "@tiptap/extension-code";
import { BoldIcon } from "lucide-react";

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          "flex gap-2 border-gray-50 items-center justify-center rounded-lg px-2 py-1",
          editor.isActive("bold") ? "bg-black/15 text-black" : "",
        )}
      >
        <BoldIcon /> bold
      </button>
    </div>
  );
};

const Editor = ({ content }: { content?: string }) => {
  const extensions = [StarterKit, CodeBlock];
  return (
    <div className="dark:bg-[#070707] bg-[#EEEEEE] rounded p-4 text-black dark:text-white">
      <EditorProvider
        extensions={extensions}
        content={content}
        slotBefore={<MenuBar />}
      ></EditorProvider>
    </div>
  );
};

export default Editor;
