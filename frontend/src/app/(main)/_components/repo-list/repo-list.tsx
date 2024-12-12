// components/GitHubRepos.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Check, FolderSyncIcon, Search } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Input } from "@nextui-org/input";

interface Repo {
  id: number;
  full_name: string;
  html_url: string;
  description: string;
  private: boolean;
  // Add other fields as needed
}

interface GithubRepoParams {
  params: {
    documentId: Id<"documents">;
  };
}

const GitHubRepos = ({ params }: GithubRepoParams) => {
  const { isSignedIn } = useAuth();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState<boolean>(false);
  const [alreadySetRepo, setAlreadySetRepo] = useState("\0");

  const setGithubRepo = useMutation(api.documents.setGithubRepo);

  const document = useQuery(api.documents.getById, {
    documentId: params.documentId,
  });

  const githubRepoUrlPattern =
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

  const writeGitHub = async (repo: Repo) => {
    const repo_url = repo.html_url;
    if (!document) {
      toast.error("Document not found.");
      return;
    }
    if (!githubRepoUrlPattern.test(repo_url)) {
      toast.error("Repository URL is not valid.");
      return;
    }

    try {
      // Update the document with the selected GitHub repo
      await setGithubRepo({
        id: document._id,
        repoName: repo_url,
      });

      // Trigger API call to generate AST
      const generateAstResponse = await fetch(
        "https://api.notepod.co/generateast",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoName: repo_url,
          }),
        },
      );

      if (!generateAstResponse.ok) {
        throw new Error("Failed to generate AST.");
      }

      setAlreadySetRepo(repo_url);
      toast.success("Repository set!");

      // Trigger API call to clone the repository
      const cloneRepoResponse = await fetch("/api/clonerepo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoInfo: repo,
        }),
      });

      if (!cloneRepoResponse.ok) {
        throw new Error("Failed to clone repository.");
      }
    } catch (err) {
      console.error("Error in writeGitHub:", err);
      toast.error("Failed to set repository.");
    }
  };

  const fetchRepos = async () => {
    if (!isSignedIn) {
      console.error("User not signed in.");
      setError("You must be signed in to load repositories.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/getrepos");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch repositories:", errorData.error);
        setError(errorData.error);
        setLoading(false);
        return;
      }

      const repoData: Repo[] = await response.json();
      setRepos(repoData);
    } catch (err) {
      console.error("Error during fetch:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
    setFetched(true);
  }, []);

  if (document === undefined) {
    return <div>Loading...</div>;
  }

  if (document === null) {
    return null;
  }

  const filteredRepos = repos.filter((repo) =>
    repo.full_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-0">
      <div className="flex gap-2 justify-center h-14 items-center ">
        <Search className="h-8 w-8" />
        <Input
          type="text"
          size="sm"
          // label="Search Repositories..."
          isClearable
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            e.preventDefault();
            e.stopPropagation();
          }}
          color="default"
          className="z-10 border border-muted-foreground/50 rounded-lg"
          placeholder="Search repositories..."
        />
        <Button
          onClick={() => {
            fetchRepos();
            setFetched(true);
          }}
          className={cn(
            `px-4 py-1 dark:text-white dark:bg-[#333333] bg-[#DDDDDD] text-black rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-200`,
            fetched &&
              !loading &&
              "dark:bg-green-400 bg-green-400 text-black dark:text-black",
          )}
          size="sm"
        >
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex gap-2 items-center">
              <GitHubLogoIcon />
              {!fetched ? (
                <div>Fetch Repos</div>
              ) : (
                <div className="flex gap-1 items-center">
                  Re-fetch repos <Check />
                </div>
              )}
            </div>
          )}
        </Button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div
        className="flex flex-col mt-4 h-[30vh] overflow-scroll gap-2
          dark:text-white text-black overflow-x-hidden"
      >
        {filteredRepos.length > 0 ? (
          filteredRepos.map((repo) => (
            <div
              key={repo.id} // Moved key to the outermost div
              className="flex justify-between p-4 w-full h-fit bg-black/10 rounded-md
                border dark:border-[#333333] border-[#BBBBBB] items-center gap-4"
            >
              <div className="flex flex-col gap-1">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate overflow-hidden overflow-ellipsis max-w-[210px] bg-transparent text-sm tracking-wide"
                  title={repo.full_name}
                >
                  {repo.full_name}
                </a>

                {repo.description ? (
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm truncate max-w-[210px] bg-transparent text-maincolor"
                    title={repo.description} // Optional: Adds a tooltip with the full description
                  >
                    {repo.description}
                  </a>
                ) : (
                  <span className="text-sm truncate max-w-[210px] bg-transparent text-muted-foreground">
                    No description provided.
                  </span>
                )}
              </div>
              <div className="h-fit w-fit bg-transparent rounded-md p-0">
                <Button
                  className="h-8 w-20 dark:bg-maincolor bg-third text-white text-xs dark:hover:bg-maincolor/80 hover:bg-third/70 hover:text-white"
                  variant="ghost"
                  onClick={() => writeGitHub(repo)}
                >
                  <FolderSyncIcon className="mr-1" />
                  Sync
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            {loading ? (
              <div>Repositories loading...</div>
            ) : (
              <div>No repositories found.</div>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default GitHubRepos;
