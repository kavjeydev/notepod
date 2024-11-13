import { Input } from "@nextui-org/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState } from "react";
import { Node, Command, NodeViewProps, Editor } from "@tiptap/core";
import React from "react";
import MarkdownIt from "markdown-it";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export interface QueryProps {
  query: string;
  response: string;
}

export function AISearch(props: NodeViewProps) {
  const { editor, deleteNode, extension } = props;
  const markdownIt = new MarkdownIt();
  const [codeQuery, setCodeQuery] = useState("");
  const update = useMutation(api.documents.update);
  const documentId = extension.options.documentId;
  console.log("document changing", documentId);

  const onChange = (content: string) => [
    update({
      id: documentId,
      content,
    }),
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/apirun", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: codeQuery }),
    });

    const result: QueryProps = await response.json();

    // Remove the current node
    deleteNode();
    const htmlContent = markdownIt.render(result.response);

    // Insert the new content into the editor
    editor.commands.insertContent(htmlContent);

    const editorContent = editor.getHTML();

    onChange(editorContent);

    console.log(result);
  };

  return (
    <NodeViewWrapper>
      <div>
        <form
          className="flex w-96 flex-wrap md:flex-nowrap gap-4"
          onSubmit={handleSubmit}
        >
          <Input
            type="text"
            label="Ask something ✨"
            isClearable
            onChange={(e) => setCodeQuery(e.target.value)}
          />
        </form>
      </div>
    </NodeViewWrapper>
  );
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    reactComponent: {
      insertReactComponent: () => ReturnType;
    };
  }
}

const ReactComponentExtension = Node.create({
  name: "reactComponent",
  group: "block", // Use 'inline' if you want it inline with text
  atom: true, // Treat it as an atomic node (no content within)

  addOptions() {
    return {
      onQuery: () => {},
      documentId: null,
    };
  },
  //   addAttributes() {
  //     return {
  //       onQuery: {
  //         default: undefined,
  //       },
  //     };
  //   },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="reactComponent"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "reactComponent", ...HTMLAttributes }];
  },

  addCommands() {
    return {
      insertReactComponent:
        () =>
        ({ chain }: any) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                onQuery: {
                  default: undefined,
                },
              }, // Add any attributes here
            })
            .run();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AISearch);
  },
});

export default ReactComponentExtension;
