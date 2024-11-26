import { Button, Input, Textarea } from "@nextui-org/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useCallback, useRef, useState } from "react";
import { Node, Command, NodeViewProps, Editor } from "@tiptap/core";
import React from "react";
import MarkdownIt from "markdown-it";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { API_ROUTE } from "../../../../../constants";

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
  const [isLengthValid, setIsLengthValid] = useState(true);

  const [streamedResponse, setStreamedResponse] = useState("");

  const update = useMutation(api.documents.update);
  const documentId = extension.options.documentId;

  const formRef = useRef<HTMLFormElement | null>(null);

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
    if (codeQuery.length < 2) {
      toast.error("Query too short.");
      setIsLengthValid(false);
      return;
    }
    setIsLengthValid(true);
    setLoading(true);
    setStreamedResponse("");

    // Capture the insertion position before deleting the node
    const insertPosition = editor.state.selection.from;

    // const apiUrl = process.env.API_ENDPOINT;

    // if (!apiUrl) {
    //   throw new Error("API_URL is not defined in the environment variables");
    // }
    // // Remove the current node (input form)

    try {
      const response = await fetch(API_ROUTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: codeQuery,
          repoUrl: document?.githubRepo,
        }),
      });

      if (!response.ok || !response.body) {
        toast.error(`Network response was not ok`);
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      // Initialize variables for buffering
      let accumulatedContent = "";
      let buffer = "";
      deleteNode();
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          console.log("Received chunk:", chunk);

          // Append the new chunk to the buffer
          buffer += chunk;

          // Check if the buffer contains a complete block
          let blockDelimiter = buffer.lastIndexOf("\n\n");
          if (blockDelimiter !== -1) {
            // Extract the complete block
            const completeBlock = buffer.substring(0, blockDelimiter + 2);
            buffer = buffer.substring(blockDelimiter + 2); // Keep the rest in the buffer

            // Append the complete block to the accumulated content
            accumulatedContent += completeBlock;

            // Render the accumulated content to HTML
            const htmlContent = markdownIt.render(accumulatedContent);

            // Replace the existing content in the editor with the new content
            editor
              .chain()
              .focus()
              .deleteRange({
                from: insertPosition,
                to: editor.state.doc.content.size,
              })
              .insertContentAt(insertPosition, htmlContent)
              .run();

            // Optionally, update the editor's state
            onChange(editor.getHTML());
          }
        }
      }

      // After the stream ends, process any remaining content
      if (buffer.length > 0) {
        accumulatedContent += buffer;
        const htmlContent = markdownIt.render(accumulatedContent);

        editor
          .chain()
          .focus()
          .deleteRange({
            from: insertPosition,
            to: editor.state.doc.content.size,
          })
          .insertContentAt(insertPosition, htmlContent)
          .run();

        onChange(editor.getHTML());
      }
    } catch (error) {
      toast.error("AI Request Failed");
      console.error("Error during fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const onTextareaKeyDown = useCallback(
    (event: any) => {
      if (event.keyCode === 13 && event.shiftKey === false) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [formRef],
  );

  // const testStreaming = async () => {
  //   try {
  //     const response = await fetch("http://127.0.0.1:8000/test-stream", {
  //       method: "POST",
  //     });

  //     const reader = response.body?.getReader();
  //     const decoder = new TextDecoder("utf-8");
  //     let done = false;

  //     while (!done && reader) {
  //       const { value, done: readerDone } = await reader.read();
  //       done = readerDone;
  //       if (value) {
  //         const chunk = decoder.decode(value, { stream: true });
  //         console.log("Test chunk:", chunk);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error during test fetch:", error);
  //   }
  // };

  // testStreaming();

  return (
    <NodeViewWrapper>
      <div>
        <form
          className="flex flex-col w-full flex-wrap md:flex-nowrap gap-4"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <div className="relative w-full">
            <Textarea
              name="idea"
              aria-label="idea"
              label="Notepod AI"
              placeholder="Ask any questions."
              onKeyDown={(event) => onTextareaKeyDown(event)}
              onChange={(e) => setCodeQuery(e.target.value)}
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                  "pr-16", // Add padding-right to accommodate the button
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "shadow-xl",
                  "bg-default-300/50 outline outline-default-500",
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

            {/* <Button
              color="secondary"
              type="submit"
              className="bg-maincolor text-white opacity-90"
            >
              Submit
            </Button> */}
            <Button
              color="secondary"
              type="submit"
              size="sm"
              className="absolute bottom-2 right-2 bg-maincolor text-white"
            >
              Submit
            </Button>
          </div>
          {/* <Text span blockquote css={{ m: 0 }}>
            Note: press <kbd>Enter</kbd> to submit and press{" "}
            <kbd>Shift + Enter</kbd> to add a new line.
          </Text> */}
          {/* <Textarea
            isInvalid={!isLengthValid}
            variant="bordered"
            label="Notepod AI"
            onChange={(e) => setCodeQuery(e.target.value)}
            onSubmit={handleSubmit}
            placeholder="Ask a question ✨"
            defaultValue="What does this code base do..."
            errorMessage="The question must be at least 2 characters long."
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
          /> */}
          {/* <Input
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
          /> */}
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
