import ast

def get_ast(full_filename):
    with open(full_filename) as f:
        code = f.read()

    node = ast.parse(code)
    print(ast.dump(node))


if __name__ == '__main__':
    get_ast('./simple.py')