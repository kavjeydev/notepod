import networkx as nx

def createGraphText():
    print("Input file:")
    V = int(input())
    Graph = nx.DiGraph()
    for i in range(V):
        Graph.add_node((i+1))
    for i in range(V):
        line = input().split()
        numE = int(line[0])
        for j in range(numE):
            Graph.add_edge(int(i+1),int(line[j+1]))
    print("All Lines pasted.")

    return Graph

def createGraphFile():
    file = input("Enter Name of File to Read From: ")
    with open(file, 'r') as f:
        V = int(f.readline())
        Graph = nx.DiGraph()
        for i in range(V):
            Graph.add_node((i+1))
        for i in range(V):
            line = f.readline().split()
            numE = int(line[0])
            for j in range(numE):
                Graph.add_edge(int(i+1),int(line[j+1]))
        f.close()

    return Graph

def createGraphFile(file):
    with open(file, 'r') as f:
        V = int(f.readline())
        Graph = nx.DiGraph()
        for i in range(V):
            Graph.add_node((i+1))
        for i in range(V):
            line = f.readline().split()
            numE = int(line[0])
            for j in range(numE):
                Graph.add_edge(int(i+1),int(line[j+1]))
        f.close()

    return Graph


def createGraph():
    choice = int(input("Text(0) or File(1): "))
    if choice == 0:
        return createGraphText()
    elif choice == 1:
        return createGraphFile()
    else:
        print("Invalid Choice, Try Again!")
        return createGraph()