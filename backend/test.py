import os
import subprocess
from langchain_community.document_loaders import DirectoryLoader
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain.chains import ConversationalRetrievalChain
import constants

# Set the API key for OpenAI
os.environ["OPENAI_API_KEY"] = constants.APIKEY

# Define the repository URL and clone directory
repo_url = 'https://github.com/kavjeydev/AlgoBowl.git'
clone_directory = './cloned_codebase'

# Clone the repository if not already done
if not os.path.exists(clone_directory):
    print(f"Cloning repository from {repo_url}...")
    subprocess.run(['git', 'clone', repo_url, clone_directory], check=True)
else:
    print(f"Repository already cloned into {clone_directory}.")

# Use DirectoryLoader to load all text files from the cloned repository
loader = DirectoryLoader(
    clone_directory,
    glob='**/*.*',  # Match all files; adjust patterns to include specific file types
    recursive=True
)

# Load documents
documents = loader.load()
print(f"Number of documents loaded: {len(documents)}")

# Define the embedding function
embeddings = OpenAIEmbeddings()

# Set up the Chroma vector store for persistence with embedding
vectorstore = Chroma(embedding_function=embeddings, persist_directory="chroma_storage")

# Add documents to the vector store
try:
    vectorstore.add_documents(documents)
    print("Documents successfully added to the vector store.")
except Exception as e:
    print(f"Error adding documents to vector store: {e}")

# Set up the LLM
llm = OpenAI(temperature=0)

# Set up a ConversationalRetrievalChain
retriever = vectorstore.as_retriever()
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)

# Main loop to query the AI about the codebase
chat_history = []  # Initialize chat history
while True:
    prompt = input("Ask about the codebase (or type 'exit' to quit): ")
    if prompt.lower() in {'exit', 'quit'}:
        break

    # Perform retrieval-based QA
    try:
        response = qa_chain.invoke({"question": prompt, "chat_history": chat_history})
        print("AI Answer:", response['answer'])

        # Optionally show source documents if needed
        for doc in response['source_documents']:
            print("--- Document Source ---")
            print(doc.page_content[:200])  # Show a snippet for context

        # Update chat_history
        chat_history.append((prompt, response['answer']))
    except Exception as e:
        print(f"Error during question answering: {e}")
