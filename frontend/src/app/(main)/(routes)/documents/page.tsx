"use client";
import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@nextui-org/react";
import { PlusCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";

export default function documentsPage() {
  const { user } = useUser();
  const create = useMutation(api.documents.create);

  const onCreate = () => {
    const promise = create({ title: "untitled" });

    toast.promise(promise, {
      loading: "Creating a new Pod...",
      success: "New Pod created!",
      error: "Failed to create new Pod",
    });
  };

  return (
    <div className="h-[100vh] flex flex-col items-center justify-center space-y-4">
      <Image src="/empty_dark1.svg" height={300} width={300} alt="empty" />
      <h2 className="text-lg font-bold">
        Welcome to {user?.firstName}&apos;s Pod
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a document
      </Button>
    </div>
  );
}
