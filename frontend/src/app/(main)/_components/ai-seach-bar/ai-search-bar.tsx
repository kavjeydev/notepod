import { Input } from "@nextui-org/react";
import { useState } from "react";

export default function AISearch() {
  const [data, setData] = useState(null);
  const [codeQuery, setCodeQuery] = useState("");

  const handleSubmit = async (event: any) => {
    console.log("here");
    event.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/apirun", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: codeQuery, result: undefined }),
    });

    const result = await response.json();
    console.log(result);
    setData(result);
  };

  return (
    <div>
      <form
        className="flex w-96 flex-wrap md:flex-nowrap gap-4"
        onSubmit={handleSubmit}
      >
        <Input
          type="text"
          label="Ask something ✨"
          isClearable
          onChange={(e) => setCodeQuery(e.target.value)}
          onSubmit={handleSubmit}
        />
      </form>
    </div>
  );
}
