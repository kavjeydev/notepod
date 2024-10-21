"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { unitize } from "gsap";

interface TitleDoubleProps {
  initialData: Doc<"documents">;
  isEditing: boolean;
}

export default function TitleDouble({
  initialData,
  isEditing,
}: TitleDoubleProps) {
  const update = useMutation(api.documents.update);
  //   const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialData.title || "untitled");

  const enableInput = () => {
    setTitle(initialData.title);
    isEditing = true;
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => {
    isEditing = false;
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    update({
      id: initialData._id,
      title: event.target.value || "untitled",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      disableInput();
    }
  };

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData && <p>{initialData.icon}</p>}

      {isEditing ? (
        <Input
          className="h-7 px-2 focus-visible:ring-transparent"
          ref={inputRef}
          onDoubleClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
        />
      ) : (
        <Button
          onDoubleClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-[20px] p-1"
        >
          <span className="truncate">{initialData?.title}</span>
        </Button>
      )}
    </div>
  );
}
