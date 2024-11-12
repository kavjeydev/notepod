"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Spinner } from "@nextui-org/react";
import CommunityCard from "../../components/community-card";
import CommunityNavbar from "../../components/navbar";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function CommunityPage() {
  // const allPublishedDocs = useQuery(api.documents.getAllPublished);
  const { results, status, loadMore } = usePaginatedQuery(
    api.documents.getFullPage,
    {},
    { initialNumItems: 3 },
  );
  const router = useRouter();
  const { isSignedIn } = useAuth();

  if (results === undefined) {
    return (
      <div className="flex items-center justify-center h-[100vh] w-[100vw]">
        <Spinner />
      </div>
    );
  }

  if (results === null) {
    return null;
  }

  return (
    <div className="overflow-scroll max-h-[100vh] min-h-[100vh] bg-[#f4f4f4] dark:bg-[#121212] pb-5">
      <CommunityNavbar />
      <div className="pr-12 pl-12 pt-1 pb-1 flex gap-2 flex-wrap-reverse mt-20">
        {results.map((document) => (
          <CommunityCard document={document} />
        ))}
      </div>
    </div>
  );
}
