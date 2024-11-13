import os

import constants
import faiss
import git
import openai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.preprocessing import normalize

origins = ["*"]


class QueryItem(BaseModel):
    query: str
    response: str | None = None
    # documentId: str
    # documentTitle: str


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API Key
openai.api_key = constants.API_KEY

repo_url = "https://github.com/kavjeydev/bitwise-longest-repeating.git"
repo_path = "/repo"


# Find filepath when @file is used
def find_file(repo_path, filepath):
    for path, directories, files in os.walk(repo_path):
        print(directories)
        if filepath in files:
            return "found %s" % os.path.join(path, filepath)
    return None


# Embedding function using OpenAI's updated API
def get_embedding(text, model="text-embedding-ada-002"):
    response = openai.embeddings.create(input=text, model=model)
    embedding = response.data[0].embedding  # Access the embedding
    return embedding


# Step 1: Fetch the code from a GitHub repository
def clone_github_repo(repo_url, clone_dir="repo"):
    if os.path.exists(clone_dir):
        print(f"Repository already cloned in {clone_dir}")
    else:
        git.Repo.clone_from(repo_url, clone_dir)
        print(f"Cloned repository into {clone_dir}")
    return clone_dir


# Step 2: Read and process the files to chunk them into sections
def read_files(repo_path):
    print("Thinking...")
    code_chunks = []
    for root, _, files in os.walk(repo_path):
        for file in files:
            if file.endswith(
                (".py", ".js", ".ts", ".html", ".css", ".md", ".cpp")
            ):  # Add relevant extensions
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    # Chunk the code if it's large
                    chunk_size = 1000  # Customize chunk size
                    for i in range(0, len(content), chunk_size):
                        chunk = content[i : i + chunk_size]
                        code_chunks.append((file_path, chunk))
    if len(code_chunks) == 0:
        with open(repo_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Chunk the code if it's large
            chunk_size = 1000  # Customize chunk size
            for i in range(0, len(content), chunk_size):
                chunk = content[i : i + chunk_size]
                code_chunks.append((repo_path, chunk))

    # print(code_chunks)
    return code_chunks


# Step 3: Embed the code chunks using OpenAI embeddings
def get_embeddings(chunks, model="text-embedding-ada-002"):
    return [get_embedding(chunk[1], model=model) for chunk in chunks]


# Step 4: Store the embeddings in a vector store (FAISS)
def store_in_faiss(embeddings):
    dimension = len(embeddings[0])
    index = faiss.IndexFlatL2(dimension)  # Create FAISS index for storing embeddings
    normalized_embeddings = normalize(embeddings, axis=1)  # Normalize embeddings
    index.add(normalized_embeddings)
    return index


# Step 5: Query the vector store and answer questions
def query_vector_store(index, chunks, question, model="gpt-4o"):
    # Step 5.1: Embed the question using OpenAI embeddings
    question_embedding = get_embedding(question, model="text-embedding-ada-002")
    question_embedding = normalize([question_embedding], axis=1)[0]

    # Step 5.2: Search the vector store for the most relevant code chunks
    k = 10  # Number of relevant results to return
    distances, indices = index.search(question_embedding.reshape(1, -1), k)

    # Step 5.3: Retrieve the corresponding code chunks
    relevant_chunks = [chunks[i] for i in indices[0]]

    # Step 5.4: Send the question along with the retrieved code to OpenAI for a detailed response
    context = "\n".join([chunk[1] for chunk in relevant_chunks])

    # Use the correct API to get a completion
    response = openai.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "You are a technical documentation expert. Given a codebase, answer some questions and write some expert documentation. Use markdown format for responses.",
            },
            {
                "role": "user",
                "content": f"Here is some code:\n{context}\n\nQuestion: {question}",
            },
        ],
    )

    # Corrected: Access the content using object attributes, not dict subscripting
    return response.choices[0].message.content


# Full pipeline: Load code, embed, store in FAISS, and query
def code_assistant_pipeline(repo_url, question, file=None):
    # Clone repo
    repo_path = clone_github_repo(repo_url)

    # Read and chunk the code
    if file:
        code_chunks = read_files(file)
    else:
        code_chunks = read_files(repo_path)

    # Embed the code chunks
    embeddings = get_embeddings(code_chunks)

    # Store embeddings in FAISS vector store
    index = store_in_faiss(embeddings)

    # Query the vector store with a question
    answer = query_vector_store(index, code_chunks, question)

    return answer


# Example usage
async def AIQuery(question):
    if question.split(" ")[0] == "@file":
        filepath = find_file(repo_path, question.split(" ")[1])
        answer = code_assistant_pipeline(
            repo_url, " ".join(question.split(" ")[2:]), filepath
        )
        return answer
    else:
        answer = code_assistant_pipeline(repo_url, question)
        return answer


@app.post("/apirun")
async def respond(queryItem: QueryItem):
    response = await AIQuery(queryItem.query)
    queryItem.response = response
    print(response)

    return queryItem
