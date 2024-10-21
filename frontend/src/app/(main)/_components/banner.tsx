"use client";

import { useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface BannerProps {
  documentId: Id<"documents">;
}

export default function Banner({ documentId }: BannerProps) {
  const router = useRouter();

  const remove = useMutation(api.documents.remove);
  const restore = useMutation(api.documents.restore);

  const onRemove = () => {
    const promise = remove({ id: documentId });
    toast.promise(promise, {
      loading: "Deleting Pod",
      success: "Pod deleted",
      error: "Failed to delete Pod",
    });

    router.push("/documents");
  };

  const onRestore = () => {
    const promise = restore({ id: documentId });
    toast.promise(promise, {
      loading: "Restoring Pod",
      success: "Pod restored",
      error: "Failed to restore Pod",
    });
  };
  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>This page is in the trash.</p>

      <Button
        size="sm"
        onClick={onRestore}
        variant="bordered"
        className="border-white bg-transparent
      hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal "
      >
        Restore
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="bordered"
          className="border-white bg-transparent
      hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal "
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
}
