"use client";

import { ImageIcon, Smile, X } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import IconPicker from "./icon-picker";
import { Button } from "./ui/button";
import { init } from "next/dist/compiled/webpack/webpack";
import { ElementRef, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import TextareaAutosize from "react-textarea-autosize";
import { useCoverImage } from "../../hooks/use-cover-image";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
}

export default function Toolbar({ initialData, preview }: ToolbarProps) {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);
  const update = useMutation(api.documents.update);

  const removeIcon = useMutation(api.documents.removeIcon);

  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview) {
      return;
    }

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onInput = (value: string) => {
    setValue(value);
    update({
      id: initialData._id,
      title: value || "untitled",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    });
  };

  const onRemoveIcon = () => {
    removeIcon({ id: initialData._id });
  };

  return (
    <div
      className="opacity-100 flex items-center cursor-pointer hover:opacity-45
    transition-opacity duration-250"
    >
      {!initialData.icon && !preview && (
        <IconPicker asChild onChange={onIconSelect}>
          <Smile className="h-4 w-4 font-bold mr-2" />
        </IconPicker>
      )}
      {initialData.icon && !preview && (
        <IconPicker asChild onChange={onIconSelect}>
          <p className="mr-2">{initialData.icon}</p>
          {/* <Smile className="h-8 w-8 font-bold" /> */}
        </IconPicker>
      )}
    </div>
  );
}
