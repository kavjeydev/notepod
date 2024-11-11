import { useRouter } from "next/navigation";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { File, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CardProps {
  document: Doc<"documents">;
}

export default function CommunityCard({ document }: CardProps) {
  const [isInteractionVisible, setIsInteractionVisible] = useState(false);

  const router = useRouter();

  const likeItem = useQuery(api.likeData.getLikeFromUser, {
    documentId: document._id,
  });

  const increaseLike = useMutation(api.documents.increaseLike);
  const addLikeToStorage = useMutation(api.likeData.addLikeFromUser);

  const decreaseLike = useMutation(api.documents.decreaseLike);
  const removeLikeFromStorage = useMutation(api.likeData.removeLikeFromUser);

  const visitPod = (initialData: Doc<"documents">) => {
    const url = `/preview/${initialData._id}`;
    window.open(url, "_blank");
  };

  const onUnlike = (docId: Id<"documents">, likeId: Id<"likeData">) => {
    const promiseDoc = decreaseLike({ id: docId });
    const promiseStore = removeLikeFromStorage({ id: likeId });

    toast.promise(promiseStore, {
      loading: "Unliking Pod...",
      success: "Pod removed from likes",
      error: "Failed to unlike Pod",
    });
  };

  const onLike = (docId: Id<"documents">) => {
    const promise = increaseLike({ id: docId });
    const promiseStore = addLikeToStorage({ id: docId });

    toast.promise(promiseStore, {
      loading: "Liking Pod...",
      success: "Pod added to likes",
      error: "Failed to like Pod",
    });
  };

  const visitGitHub = (gitUsername: string) => {
    const url = `https://www.github.com/${gitUsername}`;
    window.open(url, "_blank");
  };

  const onMouseEnter = () => {
    setIsInteractionVisible(true);
  };

  const onMouseLeave = () => {
    setIsInteractionVisible(false);
  };
  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={(e) => {
          e.stopPropagation();
          visitPod(document);
        }}
        className={cn(`hover:cursor-pointer bg-[url('/no_image.png')] rounded-lg bg-cover
        bg-center bg-no-repeat`)}
      >
        <div
          className="flex flex-col h-[10vw] w-[18vw] dark:bg-white/5 bg-black/5
            rounded-lg p-3 truncate hover:outline outline-maincolor/30 dark:outline-purple-500/50
             outline-2 transition-all duration-150 "
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {isInteractionVisible && (
            <div className="flex flex-row-reverse w-full items-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 bg-white dark:bg-black outline dark:outline-default-200
              outline-default-300 outline-1  rounded-full z-[99999] "
                onClick={(e) => {
                  if (likeItem) {
                    onUnlike(document._id, likeItem._id);
                  } else {
                    onLike(document._id);
                  }
                  e.stopPropagation();
                }}
              >
                {likeItem ? (
                  <Heart className="absolute h-12 w-12 text-muted-foreground z-[99999] fill-red-500 text-red-500" />
                ) : (
                  <Heart className="absolute h-12 w-12 text-muted-foreground z-[99999] hover:text-red-500" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 p-1 h-full items-end ">
        <img
          src={document.userProfile}
          className="h-5 w-5 mb-[2.2rem] rounded-full z-[99999] "
          onClick={(e) => {
            e.stopPropagation();
            if (document.publishedUserName)
              visitGitHub(document.publishedUserName);
          }}
        />

        <div className="flex flex-col truncate gap-0.5">
          <div className="text-sm truncate pr-1 text-default-800 dark:text-default-800 font-semibold ">
            {document.title}
          </div>
          <div
            className="text-xs truncate pr-1 text-muted-foreground hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              if (document.publishedUserName)
                visitGitHub(document.publishedUserName);
            }}
          >
            {document.publishedUserName}
          </div>
          <div className="flex gap-2">
            <div className="text-xs text-default-500 font-semibold">
              {document.likes} likes
            </div>
            <div className="text-xs text-default-500 font-semibold">
              {document.views} views
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
