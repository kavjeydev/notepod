import asyncio
import concurrent.futures
import hashlib
import json
import logging
import os
import shutil
import sqlite3
import tempfile
import time
from threading import Lock
from typing import Dict, Optional

import constants
import faiss
import git
import numpy as np
import openai
import tiktoken
from tenacity import retry, stop_after_attempt, wait_random_exponential

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Initialize tokenizer
tokenizer = tiktoken.get_encoding("cl100k_base")
MAX_TOKENS = 8191  # Maximum tokens for text-embedding-ada-002

# Set your OpenAI API key (ensure OPENAI_API_KEY is in env or replace this with your key)
openai.api_key = constants.OPENAI_API_KEY
openai.base_url = "https://api.openai.com/v1/"


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


class RepoData:
    def __init__(self, faiss_index, code_chunks):
        self.faiss_index = faiss_index
        self.code_chunks = code_chunks
        self.lock = Lock()


repo_cache: Dict[str, RepoData] = {}
repo_cache_lock = Lock()


@timing_decorator
def clone_github_repo(repo_url, clone_dir_base=None):
    if clone_dir_base is None:
        clone_dir_base = tempfile.gettempdir()

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
            raise e

    try:
        git.Repo.clone_from(repo_url, clone_dir)
        logger.info(f"Cloned repository into {clone_dir}")
    except Exception as e:
        logger.error(f"Error cloning repository: {e}")
        raise e

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
                start = 0
                while start < len(content):
                    end = len(content)
                    while True:
                        chunk = content[start:end]
                        tokens = tokenizer.encode(chunk)
                        if len(tokens) <= MAX_TOKENS:
                            break
                        else:
                            end -= int((end - start) / 2)
                            if end <= start:
                                break
                    if chunk.strip():
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
def load_embedding_cache(db_file="embedding_cache.db"):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
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
    chunks, model="text-embedding-3-small", db_file="embedding_cache.db"
):
    conn, cursor = load_embedding_cache(db_file)
    embeddings = [None] * len(chunks)
    chunk_hashes = []
    chunk_texts = []
    indices = []

    for idx, chunk in enumerate(chunks):
        chunk_text = chunk[1]
        chunk_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
        chunk_hashes.append(chunk_hash)
        chunk_texts.append(chunk_text)
        indices.append(idx)

    hash_to_embedding = {}
    batch_size = 900
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

    if texts_to_embed:
        batch_size = 100
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
                    # Use INSERT OR IGNORE to avoid UNIQUE constraint errors
                    insert_data.append((chunk_hash, json.dumps(embedding)))
                cursor.executemany(
                    "INSERT OR IGNORE INTO embeddings (hash, embedding) VALUES (?, ?)",
                    insert_data,
                )
            except Exception as e:
                logger.error("Error during embedding request:", exc_info=True)
                continue
        conn.commit()

    conn.close()
    return embeddings


@timing_decorator
def get_embedding(text, model="text-embedding-3-small"):
    try:
        response = openai.embeddings.create(input=[text], model=model)
        embedding = response.data[0].embedding
        return embedding
    except Exception as e:
        logger.error(f"Error getting embedding for text: {e}", exc_info=True)
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


def initialize_codebase(
    repo_url, embedding_model="text-embedding-3-small", clone_dir_base=None
):
    global repo_cache
    with repo_cache_lock:
        if repo_url in repo_cache:
            logger.info(f"Repository {repo_url} is already initialized.")
            return
        else:
            logger.info(f"Initializing repository {repo_url}.")
            repo_cache[repo_url] = None

    try:
        repo_path = clone_github_repo(repo_url, clone_dir_base=clone_dir_base)
        code_chunks = read_files(repo_path)
        embeddings = get_embeddings(code_chunks, model=embedding_model)
        faiss_index = store_in_faiss(embeddings)

        repo_data = RepoData(faiss_index=faiss_index, code_chunks=code_chunks)

        with repo_cache_lock:
            repo_cache[repo_url] = repo_data

        logger.info(f"Repository {repo_url} initialized successfully.")
    except Exception as e:
        with repo_cache_lock:
            del repo_cache[repo_url]
        logger.error(f"Error initializing repository {repo_url}: {e}", exc_info=True)
        raise e


def query_codebase(
    question,
    repoUrl,
    embedding_model="text-embedding-3-small",
    chat_model="gpt-3.5-turbo",
):
    global repo_cache

    with repo_cache_lock:
        repo_data = repo_cache.get(repoUrl)
        if repo_data is None:
            return "Codebase is not initialized. Please initialize first."

    faiss_index = repo_data.faiss_index
    code_chunks = repo_data.code_chunks

    if faiss_index is None or code_chunks is None:
        raise ValueError("Codebase not initialized properly.")

    question_embedding = get_embedding(question, model=embedding_model)
    question_embedding = np.array([question_embedding]).astype("float32")
    faiss.normalize_L2(question_embedding)

    k = 10
    distances, indices = faiss_index.search(question_embedding, k)
    relevant_chunks = [code_chunks[i] for i in indices[0] if i < len(code_chunks)]
    context = "\n".join([chunk[1] for chunk in relevant_chunks])

    try:
        response = openai.chat.completions.create(
            model=chat_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical documentation expert. Given a codebase, answer questions and write expert documentation in markdown format. Respond naturally. Use Markdown headings, lists, tables, and other formatting as appropriate. Do not enclose the entire response in a code block.",
                },
                {
                    "role": "user",
                    "content": f"Here is some code:\n{context}\n\nQuestion: {question}",
                },
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error generating answer: {e}", exc_info=True)
        return "Error generating answer."


def main():
    repo_url = input("Enter the GitHub repository URL: ").strip()
    question = input("Enter your question: ").strip()

    initialize_codebase(repo_url)
    answer = query_codebase(question, repo_url)
    print("\n--- Response ---\n")
    print(answer)


if __name__ == "__main__":
    main()
