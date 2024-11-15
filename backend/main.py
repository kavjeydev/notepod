import json
import os
import time

import git
from tree_sitter import Language, Parser


# Step 1: Clone the repository
def clone_repository(repo_url, clone_dir="cloned_repo"):
    if os.path.exists(clone_dir):
        print(f"Repository already cloned in {clone_dir}")
    else:
        git.Repo.clone_from(repo_url, clone_dir)
        print(f"Cloned repository into {clone_dir}")
    return clone_dir


# Step 2: Build language parsers
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


# Step 3: Get all files in the repository
def get_all_files(repo_path):
    file_paths = []
    for root, dirs, files in os.walk(repo_path):
        # Exclude the 'node_modules' directory
        if "node_modules" in dirs:
            dirs.remove("node_modules")  # This prevents os.walk from traversing it

        for file in files:
            file_paths.append(os.path.join(root, file))
    return file_paths


# Step 4: Detect file language
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


# Step 5: Parse files into ASTs
def parse_file(file_path, language, LANGUAGE_MAP):
    parser = Parser()
    parser.set_language(LANGUAGE_MAP[language])

    with open(file_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = parser.parse(bytes(code, "utf8"))
    return tree, code


# Function to convert AST node to dict
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
def main():
    start_time = time.time()
    repo_url = "https://github.com/kavjeydev/Resume-Analyzer.git"  # Replace with your repository URL
    repo_path = clone_repository(repo_url)

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


if __name__ == "__main__":
    main()
