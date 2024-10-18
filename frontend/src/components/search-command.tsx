"use client";

import { useEffect, useState } from "react";
import { File, Folder } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { useSearch } from "../../hooks/use-search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

export const SearchCommand = () => {
  const { user } = useUser();
  const router = useRouter();
  const documents = useQuery(api.documents.getSearch);
  const [mounted, setMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key == "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
    };
  }, [toggle]);

  const onSelectFile = (id: string) => {
    router.push(`/documents/${id}`);

    onClose();
  };
  const onSelectFolder = (id: string) => {
    onClose();
  };

  if (!mounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search ${user?.firstName}'s Notepod`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Documents">
          {documents?.map((doc) => (
            <div>
              {doc.isFolder ? (
                <CommandItem
                  key={doc._id}
                  value={`${doc._id}-${doc.title}`}
                  title={doc.title}
                  onSelect={onSelectFolder}
                >
                  <Folder className="m-2 h-4 w-4" />

                  <span>{doc.title}</span>
                </CommandItem>
              ) : (
                <CommandItem
                  key={doc._id}
                  value={`${doc._id}-${doc.title}`}
                  title={doc.title}
                  onSelect={onSelectFile}
                >
                  <File className="m-2 h-4 w-4" />

                  <span>{doc.title}</span>
                </CommandItem>
              )}
            </div>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
