"use client";

import { useMutation } from "convex/react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useOrigin } from "../../../../hooks/use-origin";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, Copy, Globe, Trash, Trash2, X } from "lucide-react";
import { Modal, ModalContent, useDisclosure } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { getSignedURL } from "../create/actions";
import { sign } from "crypto";

interface PublishProps {
  initialData: Doc<"documents">;
}

export default function Publish({ initialData }: PublishProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const origin = useOrigin();
  const update = useMutation(api.documents.update);

  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  const [resolvedURL, setResolvedURL] = useState<string | undefined>(undefined);

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const url = `${origin}/preview/${initialData._id}`;

  const signedURL = getSignedURL()
    .then((result) => {
      console.log(result);
      if (result.error !== undefined) {
        console.error("error");
        return;
      }
      setResolvedURL(result.success.url);
    })
    .catch((error) => {
      console.error(error);
    });

  const { theme } = useTheme();

  const fileSizeLimit = 4194304;

  const removeImage = () => {
    setFile(undefined);
    if (fileUrl) URL.revokeObjectURL(fileUrl);

    setFileUrl(undefined);
  };
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0].size && e.target.files?.[0].size > fileSizeLimit) {
      toast.error("File size cannot be larger than 4MB");
      return;
    }

    const file = e.target.files?.[0];
    setFile(file);

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    } else {
      setFileUrl(undefined);
    }
  };

  const onPublish = () => {
    setIsSubmitting(true);

    const promise = update({
      id: initialData._id,
      published: true,
    }).finally(() => {
      setIsSubmitting(false);
    });

    toast.promise(promise, {
      loading: "Publishing",
      success: "Pod Published",
      error: "Failed to Publish Pod",
    });
  };

  const onUnpublish = () => {
    setIsSubmitting(true);

    const promise = update({
      id: initialData._id,
      published: false,
    }).finally(() => {
      setIsSubmitting(false);
    });

    toast.promise(promise, {
      loading: "Unpublishing",
      success: "Pod Unpublished",
      error: "Failed to Unpublish Pod",
    });
  };

  const onCopy = () => {
    navigator.clipboard.writeText(url);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="font-semibold text-sm dark:hover:bg-default-100 hover:bg-default-300"
        onClick={() => {
          onOpen();
        }}
      >
        Publish
        {initialData.published && <Globe className="text-sky-500 w-4 h-4 " />}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="w-[60vw]"
        backdrop="blur"
      >
        <ModalContent className="w-[60vw] h-fit p-6">
          {/* <input
            type="file"
            className="bg-transparent flex-1 border-none outline-none"
            name="media"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleImage}
          /> */}
          {/* {fileUrl && file && ( */}
          <div className="w-full h-0 pb-[56.25%] relative overflow-hidden rounded-md">
            {theme === "dark" ? (
              <Image
                src={fileUrl || "/no_image.png"}
                alt="publish_image"
                layout="fill"
                objectFit="cover"
                className="relative inset-0"
                priority
              />
            ) : (
              <Image
                src={fileUrl || "/no_image_dark.png"}
                alt="publish_image"
                layout="fill"
                objectFit="cover"
                className="relative inset-0"
                priority
              />
            )}
            <label
              htmlFor="image-upload"
              className="absolute top-2 right-2 dark:bg-darkbg dark:hover:text-white hover:text-black
               text-muted-foreground bg-lightbg bg-opacity-75 rounded-lg p-1 cursor-pointer hover:bg-opacity-100 transition"
              aria-label="Upload Image"
            >
              {/* Upload Icon */}
              <div className="px-3 text-sm">Change Image</div>
            </label>
            <input
              type="file"
              id="image-upload"
              className="hidden"
              name="media"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleImage}
            />

            {/* <label
              className="absolute top-2 left-2 dark:bg-darkbg dark:hover:text-white hover:text-black
               text-muted-foreground bg-lightbg bg-opacity-75 rounded-lg p-1 cursor-pointer hover:bg-opacity-100 transition"
            > */}
            {/* Upload Icon */}
            <div
              className="absolute top-2 left-2 dark:bg-darkbg dark:hover:text-white hover:text-black
               text-muted-foreground bg-lightbg bg-opacity-75 rounded-lg p-1 cursor-pointer hover:bg-opacity-100 transition"
              onClick={removeImage}
            >
              <Trash2 className="h-4 w-4" />
            </div>
            {/* </label> */}
            {/* <input
              type="file"
              id="image-upload"
              className="hidden"
              name="media"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleImage}
            /> */}
          </div>
          {/* )} */}

          {initialData.published ? (
            <div className="space-y-4">
              <div className="flex items-center gap-x-2">
                <Globe className="text-sky-500 animate-pulse h-4 w-4" />
                <p className="text-xs font-medium text-sky-500">
                  This pod is public to the internet.
                </p>
              </div>
              <div className="flex items-center">
                <input
                  value={url}
                  className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
                  disabled
                />

                <Button
                  onClick={onCopy}
                  disabled={copied}
                  className="h-8 rounded-l-none"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button
                size="sm"
                className="w-full text-xs"
                disabled={isSubmitting}
                onClick={onUnpublish}
              >
                Unpublish
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Globe className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-2">Publish this note</p>
              <span className="text-xs text-muted-foreground mb-4">
                Share your work with others.
              </span>

              <Button
                disabled={isSubmitting}
                onClick={onPublish}
                className="w-full text-xs"
                size="sm"
              >
                Publish
              </Button>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
