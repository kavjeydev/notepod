import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect } from "react";
import styles from "./editor.module.scss";
import { Button } from "@nextui-org/react";
import TextAlign from "@tiptap/extension-text-align";

import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="control-group">
      <div
        className="button-group flex gap-2 flex-wrap leading-4 p-6 dark:bg-[#222222] bg-white rounded-tl-md
      rounded-tr-md border-t border-l border-r dark:border-white/20 border-black/20"
      >
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold") ? "is-active bg-maincolor text-white" : ""
          }
          variant="flat"
          size="sm"
        >
          Bold
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic") ? "is-active bg-maincolor text-white" : ""
          }
          variant="flat"
          size="sm"
        >
          Italic
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike") ? "is-active bg-maincolor text-white" : ""
          }
          variant="flat"
          size="sm"
        >
          Strike
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={
            editor.isActive("code") ? "is-active bg-maincolor text-white" : ""
          }
          variant="flat"
          size="sm"
        >
          Code
        </Button>
        <Button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          variant="flat"
          size="sm"
        >
          Clear marks
        </Button>
        <Button
          onClick={() => editor.chain().focus().clearNodes().run()}
          variant="flat"
          size="sm"
        >
          Clear nodes
        </Button>
        <Button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "is-active" : ""}
          variant="flat"
          size="sm"
        >
          Paragraph
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
          variant="flat"
          size="sm"
        >
          H1
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
          variant="flat"
          size="sm"
        >
          H2
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
          variant="flat"
          size="sm"
        >
          H3
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
          variant="flat"
          size="sm"
        >
          H4
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive("heading", { level: 5 }) ? "is-active" : ""
          }
          variant="flat"
          size="sm"
        >
          H5
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={
            editor.isActive("heading", { level: 6 }) ? "is-active" : ""
          }
          variant="flat"
          size="sm"
        >
          H6
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          variant="flat"
          size="sm"
        >
          Bullet list
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          variant="flat"
          size="sm"
        >
          Ordered list
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
          variant="flat"
          size="sm"
        >
          Code block
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          variant="flat"
          size="sm"
        >
          Blockquote
        </Button>
        <Button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          variant="flat"
          size="sm"
        >
          Horizontal rule
        </Button>
        <Button
          onClick={() => editor.chain().focus().setHardBreak().run()}
          variant="flat"
          size="sm"
        >
          Hard break
        </Button>
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          variant="flat"
          size="sm"
        >
          Undo
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          variant="flat"
          size="sm"
        >
          Redo
        </Button>
        <Button
          onClick={() => editor.chain().focus().setColor("#958DF1").run()}
          className={
            editor.isActive("textStyle", { color: "#958DF1" })
              ? "is-active"
              : ""
          }
          variant="flat"
          size="sm"
        >
          Purple
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          variant="flat"
          size="sm"
        >
          Left
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
          variant="flat"
          size="sm"
        >
          Center
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          variant="flat"
          size="sm"
        >
          Right
        </Button>
      </div>
      <>
        {editor && (
          <BubbleMenu
            className="bubble-menu flex gap-4 outline outline-1 outline-[#EEEEEE] dark:outline-[#222222] bg-background pr-3 pl-3 pt-1 pb-1 rounded-md"
            tippyOptions={{ duration: 100 }}
            editor={editor}
          >
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "is-active" : ""}
              variant="light"
              size="sm"
            >
              B
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "is-active" : "max-w-1"}
              variant="light"
              size="sm"
            >
              Italic
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "is-active" : ""}
              variant="light"
              size="sm"
            >
              Strike
            </Button>
          </BubbleMenu>
        )}

        {/* {editor && (
          <FloatingMenu
            className="floating-menu"
            tippyOptions={{ duration: 100 }}
            editor={editor}
          >
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive("heading", { level: 1 }) ? "is-active" : ""
              }
            >
              H1
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive("heading", { level: 2 }) ? "is-active" : ""
              }
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "is-active" : ""}
            >
              Bullet list
            </button>
          </FloatingMenu>
        )} */}

        <EditorContent editor={editor} />
      </>
    </div>
  );
};

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure(),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  TextAlign.configure({
    alignments: ["left", "right", "center"],
    types: ["heading", "paragraph"],
  }),
];

const content = `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`;

export default () => {
  return (
    <div className={styles.editor}>
      <div className="overflow-hidden">
        <EditorProvider
          slotBefore={<MenuBar />}
          extensions={extensions}
          content={content}
        ></EditorProvider>
      </div>
    </div>
  );
};
