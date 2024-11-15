import concurrent.futures
import hashlib
import json
import os
import re
import shutil
import sqlite3
import time

import constants
import faiss
import git
import numpy as np
import openai
import tiktoken
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_random_exponential
from tree_sitter import Language, Parser

# from sklearn.preprocessing import normalize

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

# repo_url = "https://github.com/kavjeydev/bitwise-longest-repeating.git"
repo_path = "/repo"


current_repo_url = None  # To store the current repository URL
faiss_index = None
code_chunks = None


@timing_decorator
def initialize_codebase(repo_url, embedding_model="text-embedding-ada-002"):
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
    embeddings = get_embeddings(code_chunks, model=embedding_model)

    # Store embeddings in a FAISS vector store
    faiss_index = store_in_faiss(embeddings)


async def query_codebase(
    question, repoUrl, embedding_model="text-embedding-ada-002", chat_model="gpt-4o"
):
    global faiss_index, code_chunks, current_repo_url
    print(repoUrl, current_repo_url)

    if current_repo_url != repoUrl:
        print("Codebase has not yet been initialized... Cloning now")
        initialize_codebase(repoUrl, embedding_model)
        current_repo_url = repoUrl
    else:
        print("Codebase already cloned...")

    if faiss_index is None or code_chunks is None:
        raise ValueError(
            "Codebase has not been initialized. Call 'initialize_codebase' first."
        )

    # Query the vector store for relevant code chunks
    question_embedding = get_embedding(question, model=embedding_model)
    question_embedding = np.array([question_embedding]).astype("float32")
    faiss.normalize_L2(question_embedding)  # Ensure embedding is normalized

    k = 10
    distances, indices = faiss_index.search(question_embedding, k)
    relevant_chunks = [code_chunks[i] for i in indices[0]]

    # Combine relevant chunks into context
    context = "\n".join(chunk[1] for chunk in relevant_chunks)

    # Generate a response using OpenAI
    response = openai.chat.completions.create(
        model=chat_model,
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
    )

    return response.choices[0].message.content


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
    conn, cursor = load_embedding_cache(db_file)
    embeddings = [None] * len(chunks)
    chunk_hashes = []
    chunk_texts = []
    indices = []

    # Collect chunk texts and hashes
    for idx, chunk in enumerate(chunks):
        chunk_text = chunk[1]
        # Optionally skip tokenization for speed
        # tokens = tokenizer.encode(chunk_text)
        # if len(tokens) > MAX_TOKENS:
        #     print(f"Chunk at index {idx} exceeds the maximum token limit and will be skipped.")
        #     continue
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
                print("Error during embedding request:", e)
                continue
        conn.commit()

    conn.close()
    return embeddings


@timing_decorator
def find_file(repo_path, filepath):
    for path, directories, files in os.walk(repo_path):
        print(directories)
        if filepath in files:
            return "found %s" % os.path.join(path, filepath)
    return None


@timing_decorator
def get_embedding(text, model="text-embedding-ada-002"):
    response = openai.embeddings.create(input=text, model=model)
    embedding = response.data[0].embedding  # Access the embedding
    return embedding


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

# Initialize the tokenizer for the model you're using

# Initialize the tokenizer
tokenizer = tiktoken.get_encoding("cl100k_base")
MAX_TOKENS = 8191  # Maximum tokens for text-embedding-ada-002 is 8191


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
                    tokens = tokenizer.encode(chunk)
                    if len(tokens) <= MAX_TOKENS:
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
    embeddings = np.ascontiguousarray(embeddings)
    faiss.normalize_L2(embeddings)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)
    return index


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


def build_language_parsers(languages, output_path="build/my-languages.so"):
    if not os.path.exists("build"):
        os.mkdir("build")
    language_so_paths = []
    for lang, repo in languages.items():
        lang_dir = f"build/tree-sitter-{lang}"
        if not os.path.exists(lang_dir):
            print(f"Cloning grammar for {lang}")
            git.Repo.clone_from(repo, lang_dir)
        language_so_paths.append(f"{lang_dir}")
    Language.build_library(output_path, language_so_paths)
    return output_path


def get_all_files(repo_path):
    file_paths = []
    for root, dirs, files in os.walk(repo_path):
        # Exclude the 'node_modules' directory
        if "node_modules" in dirs:
            dirs.remove("node_modules")  # This prevents os.walk from traversing it

        for file in files:
            file_paths.append(os.path.join(root, file))
    return file_paths


EXTENSION_LANGUAGE_MAP = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "javascript",
    ".tsx": "javascript",
    ".cpp": "cpp",
    ".hpp": "cpp",
    # Add more mappings as needed
}


def detect_language(file_path):
    ext = os.path.splitext(file_path)[1]
    return EXTENSION_LANGUAGE_MAP.get(ext)


def parse_file(file_path, language, LANGUAGE_MAP):
    parser = Parser()
    parser.set_language(LANGUAGE_MAP[language])

    with open(file_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = parser.parse(bytes(code, "utf8"))
    return tree, code


def node_to_dict(node, code):
    node_dict = {
        "type": node.type,
        "start_byte": node.start_byte,
        "end_byte": node.end_byte,
        "text": code[node.start_byte : node.end_byte],
        "children": [],
    }

    for child in node.children:
        node_dict["children"].append(node_to_dict(child, code))

    return node_dict


# Main function
async def generate_ast(repos_url):
    start_time = time.time()
    # repo_url = repos_url  # Replace with your repository URL
    # repo_path_ast = repo_path

    # Languages to support
    LANGUAGES = {
        "python": "https://github.com/tree-sitter/tree-sitter-python",
        "javascript": "https://github.com/tree-sitter/tree-sitter-javascript",
        "cpp": "https://github.com/tree-sitter/tree-sitter-cpp",
        # Add more as needed
    }

    # Build language parsers
    library_path = build_language_parsers(LANGUAGES)

    # Load the compiled languages
    LANGUAGE_MAP = {}
    for lang in LANGUAGES.keys():
        LANGUAGE_MAP[lang] = Language(library_path, lang)

    # Get all files
    all_files = get_all_files(repo_path)

    # Parse files and save ASTs
    for file_path in all_files:
        language = detect_language(file_path)
        if language:
            print(f"Parsing {file_path} as {language}")
            tree, code = parse_file(file_path, language, LANGUAGE_MAP)

            # Convert AST to dict
            ast_dict = node_to_dict(tree.root_node, code)

            # Define output path
            relative_path = os.path.relpath(file_path, repo_path)
            json_output_path = os.path.join("asts", f"{relative_path}.json")

            # Ensure the output directory exists
            os.makedirs(os.path.dirname(json_output_path), exist_ok=True)

            # Save AST to JSON file
            with open(json_output_path, "w", encoding="utf-8") as json_file:
                json.dump(ast_dict, json_file, indent=2, ensure_ascii=False)

            print(f"Saved AST to {json_output_path}")

    end_time = time.time()

    print("total time:", end_time - start_time)


@app.on_event("startup")
def on_startup():
    # Initialize the codebase when the API starts
    initialize_codebase("https://github.com/kavjeydev/bitwise-longest-repeating.git")


@app.post("/apirun")
async def respond(queryItem: QueryItem):
    try:
        start_t = time.time()
        response = await query_codebase(queryItem.query, queryItem.repoUrl)
        await generate_ast(queryItem.repoUrl)
        end_t = time.time()
        print("TOTAL TIME:", end_t - start_t)
        queryItem.response = response
        return queryItem
    except Exception as e:
        return {"error": str(e)}

    # response = await AIQuery(queryItem.query, queryItem.repoUrl)
    # await generate_ast(queryItem.repoUrl)
    # queryItem.response = response
    # print(queryItem.repoUrl)

    # return queryItem
