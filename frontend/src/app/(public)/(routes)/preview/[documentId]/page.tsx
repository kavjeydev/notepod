"use client";

import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { BlockEditor } from "@/app/(main)/_components/BlockEditor/BlockEditor";
import { useEffect, useMemo, useRef, useState } from "react";
import { Doc as YDoc } from "yjs";
import { Spinner } from "@/app/(main)/_components/ui/Spinner";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const ydoc = useMemo(() => new YDoc(), []);
  const documentPage = useQuery(api.documents.getById, {
    documentId: params.documentId,
  });
  const [viewed, setViewed] = useState(false);

  const increaseView = useMutation(api.documents.increaseView);

  const viewedPod = () => {
    const promise = increaseView({ id: params.documentId });
  };

  const [activeTime, setActiveTime] = useState(0); // State to track active time in seconds
  const intervalRef = useRef<number | NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to increment the active time every second
    const incrementActiveTime = () => {
      setActiveTime((prevTime) => prevTime + 1);
    };

    // Start the interval when the component mounts
    const startInterval = () => {
      intervalRef.current = setInterval(incrementActiveTime, 1000);
    };

    // Clear the interval
    const clearActiveInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Start counting active time
    startInterval();

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Pause timer when the page becomes inactive
        clearActiveInterval();
      } else {
        // Resume timer when the page becomes active again
        startInterval();
      }
    };

    // Add event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function when component unmounts
    return () => {
      clearActiveInterval(); // Stop the interval
      document.removeEventListener("visibilitychange", handleVisibilityChange); // Remove event listener
    };
  }, []);

  const update = useMutation(api.documents.update);

  const onChange = (content: string) => [
    update({
      id: params.documentId,
      content,
    }),
  ];

  if (documentPage === undefined) {
    return (
      <div className="flex items-center justify-center h-[100vh] w-[100vw]">
        <Spinner />
      </div>
    );
  }

  if (documentPage === null) {
    return null;
  }

  if (activeTime >= 10 && !viewed) {
    viewedPod();
    setViewed(true);
  }

  return (
    <div className="overflow-scroll max-h-[100vh] min-h-[100vh] bg-[#f4f4f4] dark:bg-[#121212] pb-5">
      <div className="h-[10vh] max-h-[100%] overflow-hidden"></div>
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        {/* <Toolbar initialData={document} /> */}

        {/* <Editor
          onChange={() => {}}
          initialContent={document.content}
          docId={params.documentId}
        /> */}
        <BlockEditor
          aiToken={undefined}
          hasCollab={false}
          ydoc={ydoc}
          docId={params.documentId}
          editable={false}
        />
        {/* <div>Time Spent: {activeTime}</div> */}
      </div>
    </div>
  );
}
