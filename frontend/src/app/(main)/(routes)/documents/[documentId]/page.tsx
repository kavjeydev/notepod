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

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const ydoc = useMemo(() => new YDoc(), []);

  return (
    <div className="overflow-scroll max-h-[100vh] min-h-[100vh] bg-[#f4f4f4] dark:bg-[#121212] pb-5">
      <div className="h-full max-h-[100%] overflow-hidden mt-20">
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
