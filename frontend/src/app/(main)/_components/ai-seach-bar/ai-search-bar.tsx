import { Input } from "@nextui-org/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState } from "react";
import { Node, Command, NodeViewProps, Editor } from "@tiptap/core";
import React from "react";
import MarkdownIt from "markdown-it";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
// import { AnimatedShinyTextDemo } from "";

export interface QueryProps {
  query: string;
  response: string;
  repoUrl: string;
}

export function AISearch(props: NodeViewProps) {
  const { editor, deleteNode, extension } = props;
  const markdownIt = new MarkdownIt();

  const [codeQuery, setCodeQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const update = useMutation(api.documents.update);
  const documentId = extension.options.documentId;

  const document = useQuery(api.documents.getById, {
    documentId: documentId,
  });

  console.log("document changing", documentId);

  const onChange = (content: string) => [
    update({
      id: documentId,
      content,
    }),
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/apirun", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: codeQuery,
          repoUrl: document?.githubRepo,
        }),
      });

      const result: QueryProps = await response.json();

      // Remove the current node
      deleteNode();
      const htmlContent = markdownIt.render(result.response);

      // Insert the new content into the editor
      editor.commands.insertContent(htmlContent);

      const editorContent = editor.getHTML();

      onChange(editorContent);
    } catch (error) {
      toast.error("AI Request Failed");
    } finally {
      setLoading(false);
    }
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
            color="default"
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "shadow-xl",
                "bg-default-300/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focus=true]:bg-default-200/50",
                "dark:group-data-[focus=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
          />
        </form>
        {loading && (
          <div>
            {/* <div className="text-xs text-muted-foreground p-1 ">
              Thinking...
            </div> */}
            <div
              className="text-sm font-medium
            bg-gradient-to-r bg-clip-text  text-transparent
            from-indigo-500 via-purple-400 to-indigo-500 p-2
            animate-text
            "
            >
              Thinking...
            </div>
          </div>
        )}
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
