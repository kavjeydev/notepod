// contexts/EditorContext.tsx
import React, { createContext, useContext } from "react";
import { Editor } from "@tiptap/react";

interface EditorContextProps {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [editor, setEditor] = React.useState<Editor | null>(null);

  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
