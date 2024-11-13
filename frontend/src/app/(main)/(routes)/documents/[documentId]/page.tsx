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

  const update = useMutation(api.documents.update);

  const [queryInfo, setQueryInfo] = useState<QueryProps>({
    query: "",
    response: "",
  });

  const handleQuery = (queryObj: QueryProps) => {
    setQueryInfo(queryObj);
  };

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
    <div className="overflow-scroll max-h-[100vh] min-h-[100vh] bg-[#f4f4f4] dark:bg-[#121212] pb-5">
      <div className="h-[10vh] max-h-[100%] overflow-hidden"></div>
      <div className="flex flex-col md:max-w-3xl lg:max-w-4xl mx-auto items-center">
        {/* <Toolbar initialData={document} /> */}
        {/* <Editor
          onChange={() => {}}
          initialContent={document.content}
          docId={params.documentId}
        /> */}
        {/* <AISearch onQuery={handleQuery} /> */}
        Response: {queryInfo.response}
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
