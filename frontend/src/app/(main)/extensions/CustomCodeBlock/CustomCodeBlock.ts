// extensions/CustomCodeBlock.js
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { all, createLowlight } from "lowlight";
import CodeBlockWithCopy from "../../_components/CodeBlockWithCopy";

// Initialize lowlight with all languages
const lowlight = createLowlight(all);

// Extend the CodeBlockLowlight extension
export const CustomCodeBlock = CodeBlockLowlight.extend({
  // Override the node view to use the custom React component
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockWithCopy);
  },
}).configure({
  lowlight,
  defaultLanguage: "javascript", // Set your default language
});
