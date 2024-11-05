"use client";

import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { Editor } from "@/components/editor";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const document = useQuery(api.documents.getById, {
    documentId: params.documentId,
  });

  const update = useMutation(api.documents.update);

  const onChange = (content: string) => [
    update({
      id: params.documentId,
      content,
    }),
  ];

  if (document === undefined) {
    return <div>Loading</div>;
  }

  if (document === null) {
    return null;
  }

  return (
    <div className="overflow-scroll max-h-[95vh] min-h-[95vh] bg-[#f4f4f4] dark:bg-[#121212] pb-5">
      <div className="h-[10vh] max-h-[100%] overflow-hidden"></div>
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        {/* <Toolbar initialData={document} /> */}

        <Editor
          onChange={() => {}}
          initialContent={document.content}
          docId={params.documentId}
        />
      </div>
    </div>
  );
}
