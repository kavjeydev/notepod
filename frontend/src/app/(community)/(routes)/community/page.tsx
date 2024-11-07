"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Spinner } from "@nextui-org/react";
import { File } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrigin } from "../../../../../hooks/use-origin";
import { Doc } from "../../../../../convex/_generated/dataModel";

export default function CommunityPage() {
  const allPublishedDocs = useQuery(api.documents.getAllPublished);
  const router = useRouter();

  const visitPod = (initialData: Doc<"documents">) => {
    const url = `/preview/${initialData._id}`;
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
            onClick={() => {
              visitPod(document);
            }}
            className="hover:cursor-pointer"
          >
            <div className="h-[275px] w-[215px] bg-slate-400"></div>
            <div>{document.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
