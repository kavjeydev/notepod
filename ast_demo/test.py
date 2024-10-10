import ast

def get_ast(full_filename):
    with open(full_filename) as f:
        code = f.read()

    node = ast.parse(code)
    print(node.body[0].names[0])


if __name__ == '__main__':
    get_ast('./input.py')