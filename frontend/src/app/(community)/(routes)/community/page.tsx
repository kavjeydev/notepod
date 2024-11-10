"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Heart } from "lucide-react";
import CommunityCard from "../../components/community-card";

export default function CommunityPage() {
  const allPublishedDocs = useQuery(api.documents.getAllPublished);

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
      <div className="p-12 flex gap-2 flex-wrap-reverse">
        {allPublishedDocs.map((document) => (
          <CommunityCard document={document} />
        ))}
      </div>
    </div>
  );
}
