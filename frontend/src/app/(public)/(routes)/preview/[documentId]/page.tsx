"use client";

import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { Editor } from "@/components/editor";
import { BlockEditor } from "@/app/(main)/_components/BlockEditor/BlockEditor";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Doc as YDoc } from "yjs";
import { useSearchParams } from "next/navigation";
import { TiptapCollabProvider } from "@hocuspocus/provider";
import AISearch from "@/app/(main)/_components/ai-seach-bar/ai-search-bar";
import { Input } from "@nextui-org/input";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

interface QueryProps {
  query: string;
  response: string;
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const ydoc = useMemo(() => new YDoc(), []);
  const document = useQuery(api.documents.getById, {
    documentId: params.documentId,
  });

  const setGithubRepo = useMutation(api.documents.setGithubRepo);

  const setGitHub = (repo: string) => {
    if (!document) {
      return null;
    }

    setGithubRepo({
      id: document?._id,
      repoName: repo,
    });
  };

  if (document === undefined) {
    return <div>Loading</div>;
  }

  if (document === null) {
    return null;
  }

  return (
    <div className="overflow-scroll max-h-[100vh] min-h-[100vh] bg-[#f4f4f4] dark:bg-[#121212] pb-5">
      <div className="h-[10vh] max-h-[100%] overflow-hidden"></div>
      <div className="flex flex-col md:max-w-3xl lg:max-w-4xl mx-auto items-center">
        <Input
          type="text"
          label="Set Repository..."
          isClearable
          onChange={(e) => {
            setGitHub(e.target.value);
            e.preventDefault();
          }}
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
        <BlockEditor
          aiToken={undefined}
          hasCollab={false}
          ydoc={ydoc}
          docId={params.documentId}
          editable={true}
        />
      </div>
    </div>
  );
}
