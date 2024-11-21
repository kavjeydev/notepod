import { Node } from "@tiptap/core";

export const StreamingNode = Node.create({
  name: "streamingNode",
  group: "block",
  content: "text*", // Allows text content
  inline: false,
  atom: false,

  parseHTML() {
    return [
      {
        tag: "div[data-type='streamingNode']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "streamingNode", ...HTMLAttributes }, 0];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-type", "streamingNode");
      dom.style.whiteSpace = "pre-wrap"; // Preserve whitespace
      dom.style.wordBreak = "break-word"; // Break long words

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "streamingNode") {
            return false;
          }
          return true;
        },
      };
    };
  },
});
