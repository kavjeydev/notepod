import concurrent.futures
import hashlib
import json
import os

# import shutil
import time
import zipfile
from io import BytesIO

import faiss

# import git
import numpy as np
import openai
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_random_exponential

import backend.api.constants as constants

# from sklearn.preprocessing import normalize


def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Function '{func.__name__}' took {end_time - start_time:.4f} seconds")
        return result

    return wrapper


origins = ["*"]


class QueryItem(BaseModel):
    query: str
    repoUrl: str | None = None
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


@timing_decorator
def load_embedding_cache(cache_file="embedding_cache.json"):
    if os.path.exists(cache_file):
        with open(cache_file, "r") as f:
            cache = json.load(f)
    else:
        cache = {}
    return cache


@timing_decorator
def save_embedding_cache(cache, cache_file="embedding_cache.json"):
    with open(cache_file, "w") as f:
        json.dump(cache, f)


@timing_decorator
@retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(6))
def get_embeddings(
    chunks, model="text-embedding-ada-002", cache_file="embedding_cache.json"
):
    cache = load_embedding_cache(cache_file)
    embeddings = []
    texts_to_embed = []
    indices_to_embed = []

    for idx, chunk in enumerate(chunks):
        chunk_text = chunk[1]
        chunk_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
        if chunk_hash in cache:
            embeddings.append(cache[chunk_hash])
        else:
            texts_to_embed.append(chunk_text)
            indices_to_embed.append((idx, chunk_hash))
            embeddings.append(None)  # Placeholder

    # Batch embedding
    if texts_to_embed:
        batch_size = 100
        for i in range(0, len(texts_to_embed), batch_size):
            batch_texts = texts_to_embed[i : i + batch_size]
            response = openai.embeddings.create(input=batch_texts, model=model)
            for j, data in enumerate(response.data):
                idx, chunk_hash = indices_to_embed[i + j]
                embedding = data.embedding
                embeddings[idx] = embedding
                cache[chunk_hash] = embedding

    save_embedding_cache(cache, cache_file)
    return embeddings


# Find filepath when @file is used


@timing_decorator
def find_file(repo_path, filepath):
    for path, directories, files in os.walk(repo_path):
        print(directories)
        if filepath in files:
            return "found %s" % os.path.join(path, filepath)
    return None


# Embedding function using OpenAI's updated API
@timing_decorator
def get_embedding(text, model="text-embedding-ada-002"):
    response = openai.embeddings.create(input=text, model=model)
    embedding = response.data[0].embedding  # Access the embedding
    return embedding


# TEMPORARY SOLUTION
@timing_decorator
def clone_github_repo(repo_url, clone_dir="repo"):
    # Convert GitHub repo URL to ZIP URL
    if repo_url.endswith(".git"):
        repo_url = repo_url[:-4]
    zip_url = f"{repo_url}/archive/refs/heads/main.zip"  # Adjust branch if needed

    response = requests.get(zip_url)
    if response.status_code != 200:
        raise Exception(f"Failed to download repository: {response.status_code}")

    with zipfile.ZipFile(BytesIO(response.content)) as zip_ref:
        zip_ref.extractall(clone_dir)

    print(f"Cloned repository into {clone_dir}")
    return clone_dir


# def clone_github_repo(repo_url, clone_dir="repo"):
#     try:
#         shutil.rmtree(clone_dir)
#     except FileNotFoundError:
#         print(f"Directory not found: {clone_dir}")

#     if os.path.exists(clone_dir):
#         print(f"Repository already cloned in {clone_dir}")
#     else:
#         git.Repo.clone_from(repo_url, clone_dir)
#         print(f"Cloned repository into {clone_dir}")
#     return clone_dir


# Step 2: Read and process the files to chunk them into sections


@timing_decorator
def read_files(repo_path):
    print("Reading and processing files...")
    code_chunks = []
    file_paths = []

    for root, _, files in os.walk(repo_path):
        for file in files:
            if file.endswith((".py", ".js", ".ts", ".html", ".css", ".md", ".cpp")):
                file_path = os.path.join(root, file)
                file_paths.append(file_path)

    def process_file(file_path):
        chunks = []
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            chunk_size = 1000
            for i in range(0, len(content), chunk_size):
                chunk = content[i : i + chunk_size]
                chunks.append((file_path, chunk))
        return chunks

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(process_file, file_paths)
        for file_chunks in results:
            code_chunks.extend(file_chunks)

    return code_chunks


# def get_embeddings(chunks, model="text-embedding-ada-002"):
#     texts = [chunk[1] for chunk in chunks]
#     batch_size = 100  # Adjust based on token limits and practical testing
#     embeddings = []

#     for i in range(0, len(texts), batch_size):
#         batch_texts = texts[i : i + batch_size]
#         response = openai.embeddings.create(input=batch_texts, model=model)
#         batch_embeddings = [data.embedding for data in response.data]
#         embeddings.extend(batch_embeddings)

#     return embeddings

# TODO TEST PERFORMANCE

# TODO FAST?
# def store_in_faiss(embeddings):
#     dimension = len(embeddings[0])
#     index = faiss.IndexFlatIP(dimension)  # Inner Product (for cosine similarity)
#     faiss.normalize_L2(embeddings)  # Normalize embeddings
#     index.add(np.array(embeddings).astype('float32'))
#     return index

# TODO SLOW

# def store_in_faiss(embeddings):
#     dimension = len(embeddings[0])
#     index = faiss.IndexFlatL2(dimension)  # Create FAISS index for storing embeddings
#     normalized_embeddings = normalize(embeddings, axis=1)  # Normalize embeddings
#     index.add(normalized_embeddings)
#     return index


# def store_in_faiss(embeddings):
#     dimension = len(embeddings[0])
#     index = faiss.IndexHNSWFlat(dimension, 32)  # 32 is the number of neighbors
#     index.add(np.array(embeddings).astype("float32"))
#     return index


@timing_decorator
def store_in_faiss(embeddings):
    embeddings = np.array(embeddings).astype("float32")
    embeddings = np.ascontiguousarray(embeddings)
    faiss.normalize_L2(embeddings)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)
    return index


# Step 5: Query the vector store and answer questions
@timing_decorator
def query_vector_store(index, chunks, question, model="gpt-4o"):
    question_embedding = get_embedding(question, model="text-embedding-ada-002")
    question_embedding = np.array([question_embedding]).astype("float32")
    question_embedding = np.ascontiguousarray(question_embedding)
    faiss.normalize_L2(question_embedding)
    k = 10
    distances, indices = index.search(question_embedding, k)
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
@timing_decorator
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
@timing_decorator
async def AIQuery(question, repo_url):
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
    response = await AIQuery(queryItem.query, queryItem.repoUrl)
    queryItem.response = response
    print(queryItem.repoUrl)

    return queryItem


@app.get("/")
async def success():
    return {"success": "success"}
