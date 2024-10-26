"use client";

import { useQuery } from "convex/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import Toolbar from "@/components/toolbar";
import Editor from "@/components/editor";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const document = useQuery(api.documents.getById, {
    documentId: params.documentId,
  });

  if (document === undefined) {
    return <div>Loading</div>;
  }

  if (document === null) {
    return null;
  }

  return (
    <div className="pb-0 overflow-scroll max-h-[90vh]">
      <div className="h-[10vh] max-h-[100%] overflow-hidden"></div>
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
        <Editor content={document.content} />
      </div>
    </div>
  );
}
