"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Spinner } from "@nextui-org/react";
import CommunityCard from "../../components/community-card";
import CommunityNavbar from "../../components/navbar";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const allPublishedDocs = useQuery(api.documents.getAllPublished);
  const router = useRouter();

  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex w-[100vw] h-[100vh] bg-default-100 dark:bg-[#121212]">
        <Spinner />
      </div>
    );
  }

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
      <CommunityNavbar />
      <div className="pr-12 pl-12 pt-1 pb-1 flex gap-2 flex-wrap-reverse mt-20">
        {allPublishedDocs.map((document) => (
          <CommunityCard document={document} />
        ))}
      </div>
    </div>
  );
}
