import asyncio
import concurrent.futures
import hashlib
import json

# Optional: Import logging
import logging
import os
import shutil
import sqlite3
import tempfile
import time
from threading import Lock
from typing import Any, Dict

import constants
import faiss
import git
import numpy as np
import openai
import tiktoken
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from starlette.concurrency import iterate_in_threadpool, run_in_threadpool
from tenacity import retry, stop_after_attempt, wait_random_exponential

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)

logger = logging.getLogger(__name__)

# Define origins for CORS
origins = ["*"]

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# client = openai.OpenAI(api_key=constants.DEEPSEEK_KEY, base_url="https://api.deepseek.com")


# Set OpenAI API Key
openai.api_key = constants.DEEPSEEK_KEY
openai.base_url = "https://api.deepseek.com/v1/"

# Initialize tokenizer
tokenizer = tiktoken.get_encoding("cl100k_base")
MAX_TOKENS = 8191  # Maximum tokens for text-embedding-ada-002


# Timing decorator for logging
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.info(
            f"Function '{func.__name__}' took {end_time - start_time:.4f} seconds"
        )
        return result

    return wrapper


# Pydantic model for API requests
class QueryItem(BaseModel):
    query: str
    repoUrl: str | None = None
    response: str | None = None


# Define RepoData class to store FAISS index and code chunks
class RepoData:
    def __init__(self, faiss_index, code_chunks):
        self.faiss_index = faiss_index
        self.code_chunks = code_chunks
        self.lock = Lock()


# Global repository cache and its lock
repo_cache: Dict[str, RepoData] = {}
repo_cache_lock = Lock()


@timing_decorator
def clone_github_repo(repo_url, clone_dir_base=None):
    """
    Clone the GitHub repository into a unique, writable directory.

    Args:
        repo_url (str): URL of the GitHub repository to clone.
        clone_dir_base (str, optional): Base directory for cloning. Defaults to system temp directory.

    Returns:
        str: Path to the cloned repository.
    """
    if clone_dir_base is None:
        # Use system temporary directory if no base directory is provided
        clone_dir_base = tempfile.gettempdir()

    # Generate a unique hash for the repository URL to create a unique directory
    repo_hash = hashlib.sha256(repo_url.encode()).hexdigest()[:10]
    clone_dir = os.path.join(clone_dir_base, repo_hash)

    if os.path.exists(clone_dir):
        logger.info(
            f"Repository already exists in {clone_dir}. Removing it for a fresh clone."
        )
        try:
            shutil.rmtree(clone_dir)
            logger.info(f"Removed existing repository in {clone_dir}")
        except Exception as e:
            logger.error(f"Error removing directory {clone_dir}: {e}")
            raise e  # Re-raise exception after logging

    # Clone the repository after ensuring the directory is removed
    try:
        git.Repo.clone_from(repo_url, clone_dir)
        logger.info(f"Cloned repository into {clone_dir}")
    except Exception as e:
        logger.error(f"Error cloning repository: {e}")
        raise e  # Re-raise exception after logging

    return clone_dir


@timing_decorator
def read_files(repo_path):
    logger.info("Reading and processing files...")
    code_chunks = []
    file_paths = []

    for root, _, files in os.walk(repo_path):
        for file in files:
            if file.endswith(
                (
                    ".py",
                    ".js",
                    ".ts",
                    ".html",
                    ".css",
                    ".md",
                    ".cpp",
                    ".jsx",
                    ".tsx",
                    ".txt",
                )
            ):
                file_path = os.path.join(root, file)
                file_paths.append(file_path)

    def process_file(file_path):
        chunks = []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Break content into smaller chunks based on token limit
                start = 0
                while start < len(content):
                    end = len(content)
                    while True:
                        chunk = content[start:end]
                        tokens = tokenizer.encode(chunk)
                        if len(tokens) <= MAX_TOKENS:
                            break
                        else:
                            # Reduce the chunk size
                            end -= int((end - start) / 2)
                            if end <= start:
                                # Cannot split further
                                break
                    if chunk.strip():  # Avoid adding empty chunks
                        chunks.append((file_path, chunk))
                    start = end
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}")
        return chunks

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(process_file, file_paths)
        for file_chunks in results:
            code_chunks.extend(file_chunks)

    return code_chunks


@timing_decorator
def store_in_faiss(embeddings):
    embeddings = np.array(embeddings).astype("float32")
    embeddings = np.ascontiguousarray(embeddings)
    faiss.normalize_L2(embeddings)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)
    return index


@timing_decorator
def load_embedding_cache(db_file="embedding_cache.db"):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    # Create table if it doesn't exist
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS embeddings (
            hash TEXT PRIMARY KEY,
            embedding TEXT
        )
    """
    )
    return conn, cursor


@timing_decorator
@retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(6))
def get_embeddings(
    chunks, model="text-embedding-ada-002", db_file="embedding_cache.db"
):
    openai.api_key = constants.OPENAI_API_KEY
    openai.base_url = "https://api.openai.com/v1/"
    conn, cursor = load_embedding_cache(db_file)
    embeddings = [None] * len(chunks)
    chunk_hashes = []
    chunk_texts = []
    indices = []

    # Collect chunk texts and hashes
    for idx, chunk in enumerate(chunks):
        chunk_text = chunk[1]
        chunk_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
        chunk_hashes.append(chunk_hash)
        chunk_texts.append(chunk_text)
        indices.append(idx)

    # Fetch all existing embeddings in batches
    hash_to_embedding = {}
    batch_size = 900  # SQLite limit is 999
    for i in range(0, len(chunk_hashes), batch_size):
        batch_hashes = chunk_hashes[i : i + batch_size]
        placeholders = ",".join(["?"] * len(batch_hashes))
        cursor.execute(
            f"SELECT hash, embedding FROM embeddings WHERE hash IN ({placeholders})",
            batch_hashes,
        )
        rows = cursor.fetchall()
        hash_to_embedding.update({row[0]: json.loads(row[1]) for row in rows})

    texts_to_embed = []
    indices_to_embed = []
    hashes_to_embed = []

    for idx, chunk_hash, chunk_text in zip(indices, chunk_hashes, chunk_texts):
        if chunk_hash in hash_to_embedding:
            embeddings[idx] = hash_to_embedding[chunk_hash]
        else:
            texts_to_embed.append(chunk_text)
            indices_to_embed.append(idx)
            hashes_to_embed.append(chunk_hash)

    # Now batch embed the texts_to_embed
    if texts_to_embed:
        batch_size = 100  # Max batch size allowed by OpenAI
        for i in range(0, len(texts_to_embed), batch_size):
            batch_texts = texts_to_embed[i : i + batch_size]
            batch_hashes = hashes_to_embed[i : i + batch_size]
            try:
                response = openai.embeddings.create(input=batch_texts, model=model)
                insert_data = []
                for j, data in enumerate(response.data):
                    idx = indices_to_embed[i + j]
                    chunk_hash = batch_hashes[j]
                    embedding = data.embedding
                    embeddings[idx] = embedding
                    insert_data.append((chunk_hash, json.dumps(embedding)))
                # Batch insert embeddings into the database
                cursor.executemany(
                    "INSERT INTO embeddings (hash, embedding) VALUES (?, ?)",
                    insert_data,
                )
            except Exception as e:
                logger.error("Error during embedding request:", exc_info=True)
                continue
        conn.commit()

    conn.close()
    openai.api_key = constants.DEEPSEEK_KEY
    openai.base_url = "https://api.deepseek.com/v1/"
    return embeddings


@timing_decorator
def get_embedding(text, model="text-embedding-ada-002"):
    try:
        openai.api_key = constants.OPENAI_API_KEY
        openai.base_url = "https://api.openai.com/v1/"
        response = openai.embeddings.create(input=text, model=model)
        embedding = response.data[0].embedding  # Access the embedding
        openai.api_key = constants.DEEPSEEK_KEY
        openai.base_url = "https://api.deepseek.com/v1/"
        return embedding
    except Exception as e:
        openai.api_key = constants.DEEPSEEK_KEY
        openai.base_url = "https://api.deepseek.com/v1/"
        logger.error(f"Error getting embedding for text: {e}", exc_info=True)
        raise e


@timing_decorator
def find_file(repo_path, filepath):
    for path, directories, files in os.walk(repo_path):
        if filepath in files:
            full_path = os.path.join(path, filepath)
            logger.info(f"Found file {filepath} at {full_path}")
            return full_path
    logger.warning(f"File {filepath} not found in repository {repo_path}")
    return None


@timing_decorator
def query_vector_store(index, chunks, question, model="deepseek-chat"):
    try:
        openai.api_key = constants.OPENAI_API_KEY
        openai.base_url = "https://api.openai.com/v1/"
        question_embedding = get_embedding(question, model="text-embedding-ada-002")
        question_embedding = np.array([question_embedding]).astype("float32")
        faiss.normalize_L2(question_embedding)  # Ensure embedding is normalized

        k = 10
        distances, indices = index.search(question_embedding, k)
        relevant_chunks = [chunks[i] for i in indices[0] if i < len(chunks)]

        # Combine relevant chunks into context
        context = "\n".join([chunk[1] for chunk in relevant_chunks])

        # Generate a response using OpenAI
        openai.api_key = constants.DEEPSEEK_KEY
        openai.base_url = "https://api.deepseek.com/v1/"
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical documentation expert. Given a codebase, answer questions and write expert documentation in markdown.",
                },
                {
                    "role": "user",
                    "content": f"Here is some code:\n{context}\n\nQuestion: {question}",
                },
            ],
            stream=True,
        )

        # Access the content using object attributes
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error querying vector store: {e}", exc_info=True)
        raise e


@timing_decorator
def store_in_faiss(embeddings):
    embeddings = np.array(embeddings).astype("float32")
    embeddings = np.ascontiguousarray(embeddings)
    faiss.normalize_L2(embeddings)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)
    return index


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


def get_all_files(repo_path):
    file_paths = []
    for root, dirs, files in os.walk(repo_path):
        # Exclude the 'node_modules' directory
        if "node_modules" in dirs:
            dirs.remove("node_modules")  # This prevents os.walk from traversing it

        for file in files:
            file_paths.append(os.path.join(root, file))
    return file_paths


def initialize_codebase(
    repo_url, embedding_model="text-embedding-ada-002", clone_dir_base=None
):
    global repo_cache
    openai.api_key = constants.OPENAI_API_KEY
    openai.base_url = "https://api.openai.com/v1/"
    # Acquire the cache lock to check if the repository is already initialized
    with repo_cache_lock:
        if repo_url in repo_cache:
            logger.info(f"Repository {repo_url} is already initialized.")
            return
        else:
            logger.info(f"Initializing repository {repo_url}.")
            # Add a placeholder to indicate that initialization is in progress
            repo_cache[repo_url] = None

    try:
        # Clone the repository
        repo_path = clone_github_repo(repo_url, clone_dir_base=clone_dir_base)

        # Parse the codebase and create chunks
        code_chunks = read_files(repo_path)

        # Generate embeddings for the chunks
        embeddings = get_embeddings(code_chunks, model=embedding_model)

        # Store embeddings in a FAISS vector store
        faiss_index = store_in_faiss(embeddings)

        # Create RepoData and add it to the cache
        repo_data = RepoData(faiss_index=faiss_index, code_chunks=code_chunks)

        with repo_cache_lock:
            repo_cache[repo_url] = repo_data

        logger.info(f"Repository {repo_url} initialized successfully.")
        openai.api_key = constants.DEEPSEEK_KEY
        openai.base_url = "https://api.deepseek.com/v1/"

    except Exception as e:
        # Remove the placeholder in case of failure
        openai.api_key = constants.DEEPSEEK_KEY
        openai.base_url = "https://api.deepseek.com/v1/"
        with repo_cache_lock:
            del repo_cache[repo_url]
        logger.error(f"Error initializing repository {repo_url}: {e}", exc_info=True)
        raise e


def query_codebase(
    question,
    repoUrl,
    embedding_model="text-embedding-ada-002",
    chat_model="deepseek-chat",
):
    global repo_cache

    # Check if the repository is already initialized
    openai.api_key = constants.OPENAI_API_KEY
    openai.base_url = "https://api.openai.com/v1/"

    with repo_cache_lock:
        repo_data = repo_cache.get(repoUrl)
        if repo_data is None:
            # Repository is not initialized; proceed to initialize
            logger.info(
                f"Repository {repoUrl} is not initialized. Starting initialization."
            )
        elif isinstance(repo_data, RepoData):
            # Repository is initialized
            pass
        else:
            # Initialization is in progress
            raise ValueError(f"Repository {repoUrl} is currently initializing.")

    if repo_data is None:
        # Initialize the repository outside the lock to prevent blocking
        initialize_codebase(repoUrl, embedding_model, clone_dir_base=None)

        # Re-acquire the cache lock to get the updated repo_data
        with repo_cache_lock:
            repo_data = repo_cache.get(repoUrl)
            if not isinstance(repo_data, RepoData):
                raise ValueError(f"Failed to initialize repository {repoUrl}.")

    # Access the FAISS index and code chunks
    faiss_index = repo_data.faiss_index
    code_chunks = repo_data.code_chunks

    if faiss_index is None or code_chunks is None:
        raise ValueError("Codebase has not been initialized properly.")

    # Query the vector store for relevant code chunks
    question_embedding = get_embedding(question, model=embedding_model)
    question_embedding = np.array([question_embedding]).astype("float32")
    faiss.normalize_L2(question_embedding)  # Ensure embedding is normalized

    k = 5
    distances, indices = faiss_index.search(question_embedding, k)
    relevant_chunks = [code_chunks[i] for i in indices[0] if i < len(code_chunks)]

    # Combine relevant chunks into context
    context = "\n".join([chunk[1] for chunk in relevant_chunks])

    # Generate a response using OpenAI
    openai.api_key = constants.DEEPSEEK_KEY
    openai.base_url = "https://api.deepseek.com/v1/"

    def make_openai_request():
        # Generate a response using OpenAI with stream=True
        openai.api_key = constants.DEEPSEEK_KEY
        openai.base_url = "https://api.deepseek.com/v1/"
        return openai.chat.completions.create(
            model=chat_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical documentation expert. Given a codebase, answer questions and write expert documentation in markdown.",
                },
                {
                    "role": "user",
                    "content": f"Here is some code:\n{context}\n\nQuestion: {question} answer questions and write expert documentation in markdown format",
                },
            ],
            stream=True,  # Enable streaming
        )

    # Run the blocking API call in a thread
    response = make_openai_request()

    # Async generator to yield response chunks
    def stream_response():
        try:
            for chunk in response:
                delta = chunk.choices[0].delta
                content = getattr(delta, "content", "")
                if content:
                    # Yield content for SSE
                    print("CONTENT", content)
                    yield f"{content}"
                # No need for await asyncio.sleep(0) here
        except Exception as e:
            logger.error(f"Error streaming response: {e}", exc_info=True)
            yield f"data: [Error]: {e}\n\n"
        finally:
            # Ensure the generator completes
            yield ""

    return stream_response()

    # response = openai.chat.completions.create(
    #     model=chat_model,
    #     messages=[
    #         {
    #             "role": "system",
    #             "content": "You are a technical documentation expert. Given a codebase, answer questions and write expert documentation in markdown.",
    #         },
    #         {
    #             "role": "user",
    #             "content": f"Here is some code:\n{context}\n\nQuestion: {question}",
    #         },
    #     ],
    #     stream=True,
    # )

    # def generate():
    #     try:
    #         for chunk in response:
    #             content = chunk["choices"][0]["delta"].get("content", "")
    #             if content:
    #                 # Optionally, format the content for SSE if needed
    #                 yield f"data: {content}\n\n"
    #     except Exception as e:
    #         logger.error(f"Error streaming response: {e}", exc_info=True)
    #         yield f"data: [Error]: {e}\n\n"

    # return generate()

    # return response.choices[0].message.content


@app.on_event("startup")
def on_startup():
    # Optionally initialize specific repositories on startup
    initial_repo_url = "https://github.com/kavjeydev/bitwise-longest-repeating.git"
    initialize_codebase(initial_repo_url, clone_dir_base=None)


@app.post("/apirun")
async def respond(queryItem: QueryItem):
    try:
        # Run the blocking query_codebase function in a thread
        generator = await run_in_threadpool(
            query_codebase, queryItem.query, queryItem.repoUrl
        )
        # Convert the synchronous generator to an async generator
        async_generator = iterate_in_threadpool(generator)
        # Return the StreamingResponse
        return StreamingResponse(
            async_generator,
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Transfer-Encoding": "chunked",
            },
        )
    except Exception as e:
        logger.error(f"Error in /apirun endpoint: {e}", exc_info=True)
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/test-stream")
async def test_stream():
    async def event_generator():
        for i in range(5):
            yield f"Chunk {i}\n"
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/plain")


# async def respond(queryItem: QueryItem):
#     try:
#         start_t = time.time()
#         response = await query_codebase(queryItem.query, queryItem.repoUrl)
#         end_t = time.time()
#         logger.info("TOTAL TIME: %.4f seconds", end_t - start_t)
#         queryItem.response = response
#         return queryItem
#     except Exception as e:
#         logger.error(f"Error in /apirun endpoint: {e}", exc_info=True)
#         return {"error": str(e)}
