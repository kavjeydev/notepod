import subprocess
from tree_sitter import Language
from tree_sitter import Language, Parser
import os
from tree_sitter import Language, Parser
import json

def clone_repo(repo_url, repo_dir="repository"):
    """Clone a GitHub repository to a specified directory."""
    subprocess.run(["git", "clone", repo_url, repo_dir])

# Example usage:
repo_url = "https://github.com/kavjeydev/AlgoBowl.git"
clone_repo(repo_url)

extension_to_language = {
    ".py": "python",
    ".js": "javascript",
    ".java": "java",
    ".c": "c",
    ".cpp": "cpp",
    ".rb": "ruby",
    ".go": "go",
    ".php": "php",
    # Add more mappings as needed...
}



# Build the shared object file for the languages
Language.build_library(
    'build/my-languages.so',  # Output shared object file
    [
        'tree-sitter-python',
        'tree-sitter-javascript',
        'tree-sitter-java',
        # Add more language grammars here...
    ]
)


# Load the compiled languages
PYTHON_LANGUAGE = Language('build/my-languages.so', 'python')
JAVASCRIPT_LANGUAGE = Language('build/my-languages.so', 'javascript')
JAVA_LANGUAGE = Language('build/my-languages.so', 'java')

# Create parsers for each language
python_parser = Parser()
python_parser.set_language(PYTHON_LANGUAGE)

javascript_parser = Parser()
javascript_parser.set_language(JAVASCRIPT_LANGUAGE)

java_parser = Parser()
java_parser.set_language(JAVA_LANGUAGE)

# Language parsers
python_parser = Parser()
python_parser.set_language(PYTHON_LANGUAGE)

javascript_parser = Parser()
javascript_parser.set_language(JAVASCRIPT_LANGUAGE)

java_parser = Parser()
java_parser.set_language(JAVA_LANGUAGE)

# Extension to parser mapping
extension_to_parser = {
    ".py": python_parser,
    ".js": javascript_parser,
    ".java": java_parser,
    # Add more mappings for other languages...
}

# Function to parse a code file and return the AST
def parse_code(file_path, parser):
    with open(file_path, 'r') as file:
        code = file.read()
    return parser.parse(bytes(code, 'utf8')).root_node

# Traverse the repository and generate ASTs
def generate_asts_for_repo(repo_dir):
    asts = {}
    for root, _, files in os.walk(repo_dir):
        for file in files:
            file_extension = os.path.splitext(file)[1]
            parser = extension_to_parser.get(file_extension)
            if parser:
                file_path = os.path.join(root, file)
                ast = parse_code(file_path, parser)
                asts[file_path] = ast
    return asts

# Example usage:
repo_dir = "./repository"
asts = generate_asts_for_repo(repo_dir)

# Print AST for each file
for file_path, ast in asts.items():
    print(f"AST for {file_path}:\n{ast}\n")

def traverse_tree(node, depth=0):
    print('  ' * depth + node.type, node.start_point, node.end_point)
    for child in node.children:
        traverse_tree(child, depth + 1)

# Example: Traverse the AST of a Python file
for file_path, ast in asts.items():
    print(f"Traversing AST for {file_path}:\n")
    traverse_tree(ast)


def ast_to_dict(node):
    """Recursively convert AST nodes to a dictionary."""
    return {
        'type': node.type,
        'start_point': node.start_point,
        'end_point': node.end_point,
        'children': [ast_to_dict(child) for child in node.children]
    }

# Example: Convert and save ASTs to a JSON file
def save_asts_to_file(asts, output_file="asts.json"):
    ast_dicts = {file_path: ast_to_dict(ast) for file_path, ast in asts.items()}
    with open(output_file, 'w') as file:
        json.dump(ast_dicts, file, indent=2)

# Example usage
save_asts_to_file(asts)
