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
import { SetGithubRepo } from "@/app/(main)/_components/set-github-repo";
import { TableOfContents } from "@/app/(main)/_components/TableOfContents";
import { Sidebar } from "@/app/(main)/_components/Sidebar";
import { useSidebar } from "@/app/(main)/hooks/useSidebar";
import { useBlockEditor } from "@/app/(main)/hooks/useBlockEditor";
import Toolbar from "@/components/toolbar";

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
  const leftSidebar = useSidebar();

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
    <div className="overflow-scroll max-h-[100vh] min-h-[100vh] bg-lightlightbg dark:bg-darkbg pb-5 overscroll-contain">
      {/* <div className="flex h-[10vh] max-h-[100%] overflow-hidden"></div> */}

      <div className="flex flex-col mx-auto items-center">
        <BlockEditor
          aiToken={undefined}
          hasCollab={false}
          ydoc={ydoc}
          docId={params.documentId}
          editable={true}
          previewMode={false}
        />
        <div className="fixed bottom-2">
          <SetGithubRepo
            params={{
              documentId: document._id,
            }}
          />
        </div>
      </div>
    </div>
  );
}
