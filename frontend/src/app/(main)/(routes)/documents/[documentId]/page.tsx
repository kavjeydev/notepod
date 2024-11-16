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
import { toast } from "sonner";
import { Button } from "@nextui-org/react";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

interface AstProps {
  repoName: string;
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const ydoc = useMemo(() => new YDoc(), []);
  const document = useQuery(api.documents.getById, {
    documentId: params.documentId,
  });
  const [gitRepo, setGitRepo] = useState("");

  const githubRepoUrlPattern =
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

  const setGithubRepo = useMutation(api.documents.setGithubRepo);

  const writeGitHub = async (repo: string) => {
    if (!document) {
      return null;
    }
    if (!githubRepoUrlPattern.test(repo)) {
      toast.error("Repository not valid.");
      return;
    }
    setGithubRepo({
      id: document?._id,
      repoName: repo,
    });

    try {
      const response = await fetch("http://127.0.0.1:8009/generateast", {
        //"http://18.116.61.111/apirun", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: repo,
        }),
      });

      toast.success("Repository set!");
    } catch {
      toast.error("Not valid repo.");
    }
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
        <div className="relative w-full mb-4">
          {" "}
          {/* Relative container with full width and bottom margin */}
          <Input
            type="text"
            label="Set Repository..."
            isClearable
            value={gitRepo}
            onChange={(e) => {
              setGitRepo(e.target.value);
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                writeGitHub(gitRepo);
                e.preventDefault();
              }
            }}
            color="default"
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                "pr-12", // Add right padding for the button
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "shadow-xl",
                "bg-default-300/50 ",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focus=true]:bg-default-200/50",
                "dark:group-data-[focus=true]:bg-default/60",
                "!cursor-text h-12",
              ],
            }}
          />
          <Button
            variant="solid"
            size="sm" // Smaller size for better fit
            onClick={() => writeGitHub(gitRepo)}
            // disabled={!gitRepo || !githubRepoUrlPattern.test(gitRepo)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2
            px-3 py-1 h-[75%] pt-2 pb-2 w-24 bg-maincolor text-white"
          >
            Submit
          </Button>
        </div>

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
