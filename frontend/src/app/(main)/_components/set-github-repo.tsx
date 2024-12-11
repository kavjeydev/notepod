import { Button, Input } from "@nextui-org/react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface GithubRepoParams {
  params: {
    documentId: Id<"documents">;
  };
}

export const SetGithubRepo = ({ params }: GithubRepoParams) => {
  const [gitRepo, setGitRepo] = useState("");
  const [alreadySetRepo, setAlreadySetRepo] = useState("\0");
  const githubRepoUrlPattern =
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

  const setGithubRepo = useMutation(api.documents.setGithubRepo);
  const document = useQuery(api.documents.getById, {
    documentId: params.documentId,
  });

  const writeGitHub = async (repo: string) => {
    if (!document) {
      return null;
    }
    if (!githubRepoUrlPattern.test(repo)) {
      toast.error("Repository not valid.");
      return;
    }
    setGithubRepo({
      id: document?._id,
      repoName: repo,
    });

    try {
      const response = await fetch("https://api.notepod.co/generateast", {
        //"http://18.116.61.111/apirun", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: repo,
        }),
      });

      setAlreadySetRepo(repo);

      toast.success("Repository set!");
    } catch {
      toast.error("Not valid repo.");
    }
  };

  if (document === undefined) {
    return <div>Loading</div>;
  }

  if (document === null) {
    return null;
  }

  return (
    <div className="flex flex-col md:max-w-3xl lg:max-w-4xl mx-auto items-center">
      <div className="relative w-[400px] top-2 mb-6 ">
        <div
          className="  backdrop-blur-md rounded-[0.85rem] p-[0.1rem]
        bg-gradient-to-r dark:from-maincolor dark:to-purple-500 from:bg-secondcolor
        from-second to-third"
        >
          <Input
            type="text"
            size="md"
            label="Set Repository..."
            isClearable
            value={gitRepo}
            onChange={(e) => {
              setGitRepo(e.target.value);
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                writeGitHub(gitRepo);
                e.preventDefault();
              }
            }}
            color="default"
            classNames={{
              label: "text-black/60 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                "pr-12 w-[21rem]", // Add right padding for the button
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "shadow-xl",
                "bg-white/90",
                "dark:bg-black/80",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-white/90",
                "dark:hover:bg-black/80",
                "group-data-[focus=true]:bg-white/90",
                "dark:group-data-[focus=true]:bg-black/80",
                "!cursor-text rounded-xl ",
              ],
            }}
          />
          <Button
            variant="solid"
            size="sm" // Smaller size for better fit
            onClick={() => writeGitHub(gitRepo)}
            // disabled={!gitRepo || !githubRepoUrlPattern.test(gitRepo)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2
            px-3 py-1 h-[58%] pt-3 mr-2 mb-1 pb-3 w-20 dark:bg-maincolor bg-third text-white"
          >
            {alreadySetRepo == gitRepo ? <div>Resync</div> : <div>Sync</div>}
          </Button>
        </div>
      </div>
    </div>
  );
};
