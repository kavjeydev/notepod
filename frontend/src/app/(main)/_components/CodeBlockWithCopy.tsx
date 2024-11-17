// components/CodeBlockWithCopy.jsx
import React, { useState } from "react";

const CodeBlockWithCopy = ({ node }: any) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    const code = node.textContent;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopySuccess(true);
        // Reset the copy success state after 2 seconds
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err);
      });
  };

  return (
    <div className="relative">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded text-sm focus:outline-none"
        aria-label="Copy code to clipboard"
      >
        {copySuccess ? "Copied!" : "Copy"}
      </button>

      {/* Code Block */}
      <pre className="overflow-x-auto p-4 bg-gray-100 rounded">
        <code className={`language-${node.attrs.language || "javascript"}`}>
          {node.textContent}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlockWithCopy;
