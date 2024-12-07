// components/GitHubRepos.tsx
import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

interface Repo {
  id: number;
  full_name: string;
  html_url: string;
  description: string;
  // Add other fields as needed
}

const GitHubRepos: React.FC = () => {
  const { isSignedIn } = useAuth();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
      console.log("User Repos:", repoData);
      setRepos(repoData);
    } catch (err) {
      console.error("Error during fetch:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  //   fetchRepos();

  return (
    <div className="p-4">
      <button
        onClick={fetchRepos}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {loading ? "Loading..." : "Load My GitHub Repos"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <ul className="mt-4 list-disc list-inside">
        {repos.map((repo) => (
          <li key={repo.id}>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              {repo.full_name}
            </a>
            {repo.description && <p className="text-sm">{repo.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GitHubRepos;
