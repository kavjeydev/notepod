"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Doc } from "../../../../../convex/_generated/dataModel";

export default function CommunityPage() {
  const allPublishedDocs = useQuery(api.documents.getAllPublished);
  const router = useRouter();

  const visitPod = (initialData: Doc<"documents">) => {
    const url = `/preview/${initialData._id}`;
    window.open(url, "_blank");
  };

  const visitGitHub = (gitUsername: string) => {
    const url = `https://www.github.com/${gitUsername}`;
    window.open(url, "_blank");
  };

  if (allPublishedDocs === undefined) {
    return (
      <div className="flex items-center justify-center h-[100vh] w-[100vw]">
        <Spinner />
      </div>
    );
  }

  if (allPublishedDocs === null) {
    return null;
  }

  return (
    <div className="overflow-scroll max-h-[100vh] min-h-[100vh] bg-[#f4f4f4] dark:bg-[#121212] pb-5">
      <div className="p-12 flex gap-8 flex-wrap-reverse">
        {allPublishedDocs.map((document) => (
          <div
            onClick={(e) => {
              e.stopPropagation();
              visitPod(document);
            }}
            className="hover:cursor-pointer"
          >
            <div className="flex h-[19.097vw] w-[14.931vw] dark:bg-white/20 bg-black/10 rounded-md items-end p-1 truncate">
              <div className="flex gap-2 p-1">
                <img
                  src={document.userProfile}
                  className="h-4 w-4 mt-[0.0625rem] rounded-full z-[99999]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (document.publishedUserName)
                      visitGitHub(document.publishedUserName);
                  }}
                />

                <div className="flex flex-col truncate gap-0.5">
                  <div className="text-sm truncate pr-1 text-default-800 dark:text-default-800 font-semibold">
                    {document.title}
                  </div>
                  <div
                    className="text-xs truncate pr-1 text-muted-foreground hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (document.publishedUserName)
                        visitGitHub(document.publishedUserName);
                    }}
                  >
                    {document.publishedUserName}
                  </div>
                  <div className="flex gap-2">
                    <div className="text-xs text-default-500 font-semibold">
                      0 likes
                    </div>
                    <div className="text-xs text-default-500 font-semibold">
                      0 views
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
