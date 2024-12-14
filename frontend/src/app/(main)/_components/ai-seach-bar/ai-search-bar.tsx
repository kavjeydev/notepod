import { Button, Textarea, Select, SelectItem } from "@nextui-org/react";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  NodeViewProps,
} from "@tiptap/react";
import { useCallback, useRef, useState } from "react";
import { Node } from "@tiptap/core";
import MarkdownIt from "markdown-it";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import getCaretCoordinates from "textarea-caret";
import { toast } from "sonner";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { IconBrandPython } from "@tabler/icons-react";
import { Tooltip } from "@nextui-org/react";
import GitHubRepos from "../repo-list/repo-list";
import { useAuth } from "@clerk/clerk-react";
import { Mic, MicOff } from "lucide-react";
import React, { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export interface QueryProps {
  query: string;
  response: string;
  repoUrl: string;
}

interface MentionableItem {
  id: string;
  name: string;
}

interface Repo {
  id: number;
  full_name: string;
  html_url: string;
  description: string;
  // Add other fields as needed
}

export function AISearch(props: NodeViewProps) {
  const { editor, deleteNode, extension } = props;
  const markdownIt = new MarkdownIt();

  const [codeQuery, setCodeQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLengthValid, setIsLengthValid] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  const [streamedResponse, setStreamedResponse] = useState("");

  const update = useMutation(api.documents.update);
  const documentId = extension.options.documentId;

  const formRef = useRef<HTMLFormElement | null>(null);

  const documentConvex = useQuery(api.documents.getById, {
    documentId: documentId,
  });

  const [mentionQuery, setMentionQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MentionableItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [caretCoordinates, setCaretCoordinates] = useState({ x: 0, y: 0 });
  const [repos, setRepos] = useState<Repo[]>([]);
  const [fetched, setFetched] = useState<boolean>(false);

  const { isSignedIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const [mentionableItems, setMentionableItems] = useState<MentionableItem[]>([
    { id: "1", name: "new_test.py" },
    { id: "2", name: "generate_ast.py " },
    { id: "3", name: "api.py" },
    { id: "4", name: "code_bert.py" },
    // ... more items
  ]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const toggle = () => {
    SpeechRecognition.startListening();
  };
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key == "1" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
    };
  }, [toggle]);

  const calculateCaretCoordinates = (
    textarea: HTMLInputElement,
    position: number,
  ) => {
    const { top, left } = getCaretCoordinates(textarea, position);
    const textareaRect = textarea.getBoundingClientRect();

    return {
      x: left + textareaRect.left - textarea.scrollLeft,
      y: top + textareaRect.top - textarea.scrollTop,
    };
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCodeQuery(value);

    const selectionStart = e.target.selectionStart || 0;
    const textUpToCursor = value.substring(0, selectionStart);

    // Use regex to find the last mention in textUpToCursor
    const mentionRegex = /@([^\s@]*)$/;
    const mentionMatch = textUpToCursor.match(mentionRegex);

    if (mentionMatch) {
      const mentionText = mentionMatch[1]; // Text after '@'

      setMentionQuery(mentionText);

      // Filter mentionable items
      const filteredSuggestions = mentionableItems.filter((item) =>
        item.name.toLowerCase().startsWith(mentionText.toLowerCase()),
      );

      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);

      // Calculate caret coordinates
      const coordinates = calculateCaretCoordinates(e.target, selectionStart);
      setCaretCoordinates(coordinates);

      return;
    }

    setShowSuggestions(false);
    setMentionQuery("");
    setSuggestions([]);
  };

  const handleSuggestionClick = (item: MentionableItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const value = codeQuery;
    const selectionStart = textarea.selectionStart || 0;
    const selectionEnd = textarea.selectionEnd || 0;

    const textUpToCursor = value.substring(0, selectionStart);

    // Use regex to find the mention to replace
    const mentionRegex = /@([^\s@]*)$/;
    const mentionMatch = textUpToCursor.match(mentionRegex);

    if (mentionMatch) {
      const mentionStart = selectionStart - mentionMatch[0].length;

      const beforeMention = value.substring(0, mentionStart);
      const afterMention = value.substring(selectionEnd);

      const newValue = `${beforeMention}@${item.name} ${afterMention}`;

      setCodeQuery(newValue);
      setShowSuggestions(false);
      setMentionQuery("");
      setSuggestions([]);
      setSelectedSuggestionIndex(0);

      // Update cursor position
      const newCursorPosition = beforeMention.length + item.name.length + 2; // +2 for '@' and space

      setTimeout(() => {
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);
    }
  };

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

    try {
      const response = await fetch("https://api.notepod.co/apirun", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: codeQuery,
          repoUrl: documentConvex?.githubRepo,
          model: selectedModel,
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
            console.log("CURRENT POS", editor.state.selection.from);
            editor
              .chain()
              .focus()
              .deleteRange({
                from: insertPosition,
                // to: insertPosition + 1
                to: editor.state.selection.from,
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
            // to: insertPosition
            to: editor.state.selection.from,
          })
          .insertContentAt(insertPosition, htmlContent)
          .run();

        onChange(editor.getHTML());
      }

      deleteNode();
    } catch (error) {
      toast.error("AI Request Failed");
      console.error("Error during fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const onTextareaKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedSuggestionIndex((prevIndex) =>
            prevIndex + 1 < suggestions.length ? prevIndex + 1 : 0,
          );
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedSuggestionIndex((prevIndex) =>
            prevIndex - 1 >= 0 ? prevIndex - 1 : suggestions.length - 1,
          );
        } else if (event.key === "Enter") {
          event.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else if (event.key === "Escape") {
          setShowSuggestions(false);
        }
      } else if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [
      showSuggestions,
      suggestions,
      selectedSuggestionIndex,
      formRef,
      handleSuggestionClick,
    ],
  );

  return (
    <NodeViewWrapper>
      <div className="relative">
        <form
          className="flex flex-col w-full flex-wrap md:flex-nowrap gap-4"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <div className="relative w-full flex items-center dark:bg-black/90 bg-white/90 rounded-lg">
            <Textarea
              ref={textareaRef}
              name="idea"
              aria-label="idea"
              label="Notepod AI"
              placeholder="Ask any questions."
              value={codeQuery}
              onKeyDown={onTextareaKeyDown}
              onChange={handleTextareaChange}
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                  "pb-8", // Increased padding-right to accommodate the dropdown and button
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "shadow-xl",
                  "bg-default-300/50 outline outline-default-500",
                  "dark:bg-default/60",
                  // "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focus=true]:bg-default-200/50",
                  "dark:group-data-[focus=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
            />

            <Select
              // label={undefined}

              placeholder="gpt-4o"
              selectedKeys={new Set([selectedModel])}
              defaultSelectedKeys={new Set(["gpt-4o"])}
              disabledKeys={new Set(["o1-preview", "o1-mini"])}
              onSelectionChange={(keys: any) => {
                const value = Array.from(keys).join("");
                setSelectedModel(value);
              }}
              // selected
              size="sm"
              variant="underlined"
              classNames={{
                base: "absolute bottom-2 right-20 w-36 outline-b outline-muted-foreground",
                listboxWrapper: "max-h-[200px]",
                // mainWrapper: "bg-purple-500",
              }}
            >
              <SelectItem key="gpt-3.5" value="gpt-3.5">
                gpt-3.5
              </SelectItem>
              <SelectItem key="gpt-4o" value="gpt-4o">
                gpt-4o
              </SelectItem>
              <SelectItem key="deepseek" value="deepseek">
                Deepseek V2
              </SelectItem>

              <SelectItem key="o1-preview" value="o1-preview">
                o1-preview 🚀
              </SelectItem>
              <SelectItem key="o1-mini" value="o1-mini">
                o1-mini ✨
              </SelectItem>
            </Select>

            {/* Submit Button */}
            <Button
              color="secondary"
              type="submit"
              size="sm"
              className="absolute bottom-2 right-2 dark:bg-maincolor bg-third text-white"
            >
              Submit
            </Button>
          </div>
        </form>

        {/* Always render the suggestions dropdown */}
        <div
          className={`absolute z-10 bg-white dark:bg-black border border-gray-300 rounded-2xl
            shadow-md overflow-auto transition-opacity duration-200 ${
              showSuggestions && suggestions.length > 0
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          style={{
            top: 40, // Adjust as needed
            left: caretCoordinates.x - 520,
            width: "150px",
            maxHeight: "160px",
          }}
        >
          <div className="p-2">
            {suggestions.length > 0 &&
              suggestions.map((item, index) => (
                <div className="rounded-lg text-sm h-fit">
                  <div
                    key={item.id}
                    className={`p-1.5 cursor-pointer rounded-lg flex gap-1 items-center ${
                      index === selectedSuggestionIndex
                        ? "dark:bg-[#222222] bg-[#D4D4D8] transition-all \
                      duration-200 "
                        : ""
                    }`}
                    onClick={() => handleSuggestionClick(item)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  >
                    {/* <HamburgerMenuIcon className="h-3 w-3" /> */}
                    <IconBrandPython className="h-3 w-3" />
                    {item.name}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {loading && (
          <div>
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
  group: "block",
  atom: true,

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
              },
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
