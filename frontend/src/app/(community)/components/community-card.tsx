import { useRouter } from "next/navigation";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface CardProps {
  document: Doc<"documents">;
}

export default function CommunityCard({ document }: CardProps) {
  const [isInteractionVisible, setIsInteractionVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const router = useRouter();

  const increaseLike = useMutation(api.documents.increaseLike);
  const decreaseLike = useMutation(api.documents.decreaseLike);
  const increaseView = useMutation(api.documents.increaseView);

  const visitPod = (initialData: Doc<"documents">) => {
    const url = `/preview/${initialData._id}`;
    const promise = increaseView({ id: initialData._id });
    window.open(url, "_blank");
  };

  const onUnlike = (docId: Id<"documents">) => {
    const promise = decreaseLike({ id: docId });
    setIsLiked(false);
  };

  const onLike = (docId: Id<"documents">) => {
    const promise = increaseLike({ id: docId });
    setIsLiked(true);
  };

  //   const toggleLike = (docId: Id<"documents">) => {
  //     const promise = increaseLike({ id: docId });
  //     setIsLiked(!isLiked);
  //   };

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
    <div
      onClick={(e) => {
        e.stopPropagation();
        visitPod(document);
      }}
      className="hover:cursor-pointer"
    >
      <div
        className="flex flex-col h-[13.931vw] w-[20.97vw] dark:bg-white/5 bg-black/5
            rounded-lg p-3 truncate hover:outline outline-maincolor/30 dark:outline-purple-500/50
            transition-all ease-linear duration-150 outline-2"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {isInteractionVisible && (
          <div className="flex flex-row-reverse w-full items-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 bg-white dark:bg-black outline dark:outline-default-200
              outline-default-300 outline-1  rounded-full z-[99999]"
              onClick={(e) => {
                if (isLiked) {
                  onUnlike(document._id);
                } else {
                  onLike(document._id);
                }
                e.stopPropagation();
              }}
            >
              {isLiked ? (
                <Heart className="absolute h-12 w-12 text-muted-foreground z-[99999] fill-red-500 text-red-500" />
              ) : (
                <Heart className="absolute h-12 w-12 text-muted-foreground z-[99999] hover:text-red-500" />
              )}
            </Button>
          </div>
        )}
        <div className="flex gap-2 p-1 h-full items-end">
          <img
            src={document.userProfile}
            className="h-5 w-5 mb-[2.2rem] rounded-full z-[99999]"
            onClick={(e) => {
              e.stopPropagation();
              if (document.publishedUserName)
                visitGitHub(document.publishedUserName);
            }}
          />

          <div className="flex flex-col truncate gap-0.5">
            <div className="text-sm truncate pr-1 text-default-800 dark:text-default-800 font-semibold">
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
    </div>
  );
}
