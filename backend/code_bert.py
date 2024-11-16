import concurrent.futures
import hashlib
import json
import os
import re
import shutil
import sqlite3
import time

import faiss
import git
import numpy as np
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_random_exponential
from transformers import AutoModel, AutoModelForCausalLM, AutoTokenizer

origins = ["*"]


def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Function '{func.__name__}' took {end_time - start_time:.4f} seconds")
        return result

    return wrapper


class QueryItem(BaseModel):
    query: str
    repoUrl: str | None = None
    response: str | None = None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CodeBERT tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
model = AutoModel.from_pretrained("microsoft/codebert-base")
model.to("cpu")  # Use 'cuda' if available

# Initialize GPT-J model and tokenizer
chat_model_name = "EleutherAI/gpt-j-6B"
chat_tokenizer = AutoTokenizer.from_pretrained(chat_model_name)
chat_model = AutoModelForCausalLM.from_pretrained(chat_model_name)
chat_model.to("cpu")  # Use 'cuda' if available

repo_path = "/repo"

current_repo_url = None  # To store the current repository URL
faiss_index = None
code_chunks = None


@timing_decorator
def initialize_codebase(repo_url):
    global faiss_index, code_chunks, current_repo_url

    if current_repo_url == repo_url:
        print(f"Repository {repo_url} is already initialized.")
        return
    else:
        print("Codebase has not yet been initialized... Cloning now")

    # Clone the repository
    repo_path = clone_github_repo(repo_url)

    # Parse the codebase and create chunks
    code_chunks = read_files(repo_path)

    # Generate embeddings for the chunks
    embeddings = get_embeddings(code_chunks)

    # Store embeddings in a FAISS vector store
    faiss_index = store_in_faiss(embeddings)

    current_repo_url = repo_url  # Update the current repository URL


def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    # Mean pooling
    embeddings = outputs.last_hidden_state.mean(dim=1).squeeze()
    return embeddings.numpy()


def get_embeddings(chunks):
    embeddings = []
    for file_path, chunk in chunks:
        embedding = get_embedding(chunk)
        embeddings.append(embedding)
    return embeddings


@timing_decorator
def query_vector_store(
    index: faiss.IndexFlatIP,
    chunks: list,
    question: str,
    k: int = 10,
    max_length: int = 512,
) -> str:
    """
    Query the FAISS index with the question, retrieve top k relevant code chunks,
    and generate a response using GPT-J.

    Args:
        index (faiss.IndexFlatIP): FAISS index containing code embeddings.
        chunks (list): List of tuples containing (file_path, code_chunk).
        question (str): The user's question.
        k (int): Number of top similar chunks to retrieve.
        max_length (int): Maximum length of the generated response.

    Returns:
        str: The generated response.
    """
    # Step 1: Embed the question using CodeBERT
    print("Generating embedding for the question...")
    question_embedding = get_embedding(question)
    question_embedding = np.array([question_embedding]).astype("float32")
    faiss.normalize_L2(question_embedding)  # Normalize the embedding

    # Step 2: Query the FAISS index for top k similar code chunks
    print(f"Searching for the top {k} similar code chunks...")
    distances, indices = index.search(question_embedding, k)
    relevant_chunks = [chunks[i] for i in indices[0]]

    # Step 3: Concatenate the retrieved code chunks to form context
    print("Concatenating relevant code chunks into context...")
    context = "\n\n".join(
        [f"File: {chunk[0]}\nCode:\n{chunk[1]}" for chunk in relevant_chunks]
    )

    # Step 4: Create a prompt for GPT-J
    prompt = (
        "You are a technical documentation expert. Given the following code snippets, "
        "answer the question in markdown format.\n\n"
        f"Code Snippets:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer:"
    )

    # Step 5: Tokenize and generate response using GPT-J
    print("Generating response using GPT-J...")
    inputs = chat_tokenizer.encode(prompt, return_tensors="pt")
    inputs = inputs.to(chat_model.device)

    with torch.no_grad():
        outputs = chat_model.generate(
            inputs,
            max_length=max_length,
            num_return_sequences=1,
            no_repeat_ngram_size=2,
            early_stopping=True,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
        )

    response = chat_tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Optional: Extract only the answer part if the model tends to repeat the prompt
    if "Answer:" in response:
        answer = response.split("Answer:")[-1].strip()
    else:
        answer = response.strip()

    print("Response generated.")
    return answer


@timing_decorator
def get_latest_commit_hash(repo_path):
    repo = git.Repo(repo_path)
    latest_commit = repo.head.commit.hexsha
    return latest_commit


@timing_decorator
def has_repo_changed(repo_path, hash_file="commit_hash.txt"):
    current_hash = get_latest_commit_hash(repo_path)
    if os.path.exists(hash_file):
        with open(hash_file, "r") as f:
            stored_hash = f.read().strip()
        return current_hash != stored_hash
    else:
        return True


@timing_decorator
def update_stored_hash(repo_path, hash_file="commit_hash.txt"):
    current_hash = get_latest_commit_hash(repo_path)
    with open(hash_file, "w") as f:
        f.write(current_hash)


@timing_decorator
def load_embedding_cache(db_file="embedding_cache.db"):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    # Create table if it doesn't exist
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS embeddings (
            hash TEXT PRIMARY KEY,
            embedding BLOB
        )
    """
    )
    return conn, cursor


@timing_decorator
@retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(6))
def get_embeddings_from_cache(chunks, db_file="embedding_cache.db"):
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
        for row in rows:
            hash_to_embedding[row[0]] = np.frombuffer(row[1], dtype=np.float32)

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
        for text, hash_val, idx in zip(
            texts_to_embed, hashes_to_embed, indices_to_embed
        ):
            try:
                embedding = get_embedding(text)
                embeddings[idx] = embedding
                cursor.execute(
                    "INSERT INTO embeddings (hash, embedding) VALUES (?, ?)",
                    (hash_val, embedding.tobytes()),
                )
            except Exception as e:
                print("Error during embedding generation:", e)
                continue
        conn.commit()

    conn.close()
    return embeddings


@timing_decorator
def load_embeddings(chunks):
    return get_embeddings_from_cache(chunks)


@timing_decorator
def find_file(repo_path, filepath):
    for path, directories, files in os.walk(repo_path):
        print(directories)
        if filepath in files:
            return "found %s" % os.path.join(path, filepath)
    return None


@timing_decorator
def clone_github_repo(repo_url, clone_dir="repo"):
    try:
        shutil.rmtree(clone_dir)
    except FileNotFoundError:
        print(f"Directory not found: {clone_dir}")

    if os.path.exists(clone_dir):
        print(f"Repository already cloned in {clone_dir}")
    else:
        git.Repo.clone_from(repo_url, clone_dir)
        print(f"Cloned repository into {clone_dir}")
    return clone_dir


# Step 2: Read and process the files to chunk them into sections

# Precompile regex patterns at the module level
python_def_regex = re.compile(r"^\s*def\s+", re.MULTILINE)

# Define file extensions at the module level
python_extensions = {".py"}
other_code_extensions = {".js", ".ts", ".cpp", ".jsx", ".tsx"}
text_extensions = {".html", ".css", ".md"}

MAX_TOKENS = 8191  # Adjust if necessary


def read_files(repo_path):
    print("Reading and processing files...")
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
                # print("Valid file:", file)
                file_path = os.path.join(root, file)
                file_paths.append(file_path)

    def process_file(file_path):
        chunks = []
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Break content into smaller chunks based on token limit
            start = 0
            while start < len(content):
                end = len(content)
                while True:
                    chunk = content[start:end]
                    # For CodeBERT, since we're using Transformers directly, limit by tokens
                    tokens = tokenizer.encode(chunk, truncation=True, max_length=512)
                    if len(tokens) <= 512:
                        break
                    else:
                        # Reduce the chunk size
                        end -= int((end - start) / 2)
                        if end <= start:
                            # Cannot split further
                            break
                chunks.append((file_path, chunk))
                start = end
        return chunks

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(process_file, file_paths)
        for file_chunks in results:
            code_chunks.extend(file_chunks)

    return code_chunks


@timing_decorator
def store_in_faiss(embeddings):
    embeddings = np.array(embeddings).astype("float32")
    faiss.normalize_L2(embeddings)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)
    return index


@timing_decorator
def code_assistant_pipeline(repo_url: str, question: str, file: str = None) -> str:
    """
    Pipeline to process the repository, embed code chunks, store in FAISS, and generate an answer.

    Args:
        repo_url (str): The URL of the repository to analyze.
        question (str): The user's question.
        file (str, optional): Specific file to analyze. Defaults to None.

    Returns:
        str: The generated answer.
    """
    # Clone repo
    repo_path = clone_github_repo(repo_url)

    # Read and chunk the code
    if file:
        code_chunks = read_files(file)
    else:
        code_chunks = read_files(repo_path)

    # Embed the code chunks
    embeddings = load_embeddings(code_chunks)

    # Store embeddings in FAISS vector store
    index = store_in_faiss(embeddings)

    # Query the vector store with a question
    answer = query_vector_store(
        index=index, chunks=code_chunks, question=question, k=10, max_length=512
    )

    return answer


@timing_decorator
async def AIQuery(question: str, repo_url: str) -> str:
    """
    Asynchronous function to handle AI queries.

    Args:
        question (str): The user's question.
        repo_url (str): The URL of the repository to analyze.

    Returns:
        str: The generated answer.
    """
    if question.startswith("@file"):
        parts = question.split(" ", 2)
        if len(parts) < 3:
            raise ValueError(
                "Invalid @file command format. Expected '@file <filepath> <question>'."
            )
        filepath = parts[1]
        sub_question = parts[2]
        answer = code_assistant_pipeline(
            repo_url=repo_url, question=sub_question, file=filepath
        )
        return answer
    else:
        answer = code_assistant_pipeline(repo_url=repo_url, question=question)
        return answer


@app.on_event("startup")
def on_startup():
    # Initialize the codebase when the API starts
    default_repo = "https://github.com/kavjeydev/bitwise-longest-repeating.git"
    initialize_codebase(default_repo)


@app.post("/apirun")
async def respond(queryItem: QueryItem):
    try:
        start_t = time.time()
        response = await AIQuery(
            question=queryItem.query,
            repo_url=queryItem.repoUrl
            or "https://github.com/kavjeydev/bitwise-longest-repeating.git",
        )
        end_t = time.time()
        print("TOTAL TIME:", end_t - start_t)
        queryItem.response = response
        return queryItem
    except Exception as e:
        return {"error": str(e)}
