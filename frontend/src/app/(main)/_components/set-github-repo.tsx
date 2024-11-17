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
      const response = await fetch("http://127.0.0.1:8009/generateast", {
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
      <div className="relative w-[400px] top-2 mb-4 ">
        <div className=" p-2 dark:bg-black/20 bg-black/10 rounded-xl">
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
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                "pr-12 w-[21rem]", // Add right padding for the button
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "shadow-xl",
                "bg-white/50 ",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focus=true]:bg-default-200/50",
                "dark:group-data-[focus=true]:bg-default/60",
                "!cursor-text rounded-xl",
              ],
            }}
          />
          <Button
            variant="solid"
            size="sm" // Smaller size for better fit
            onClick={() => writeGitHub(gitRepo)}
            // disabled={!gitRepo || !githubRepoUrlPattern.test(gitRepo)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2
            px-3 py-1 h-[75%] pt-2 pb-2 w-20 bg-maincolor text-white"
          >
            {alreadySetRepo == gitRepo ? <div>Resync</div> : <div>Sync</div>}
          </Button>
        </div>
      </div>
    </div>
  );
};
