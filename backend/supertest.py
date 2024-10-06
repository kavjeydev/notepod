import os
import getpass

from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import DeepLake
import constants
from langchain.document_loaders import TextLoader, DirectoryLoader
from langchain.chat_models import ChatOpenAI
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores.utils import maximal_marginal_relevance



os.environ['OPENAI_API_KEY'] = constants.API_KEY
os.environ['ACTIVELOOP_TOKEN'] = constants.DEEPLAKE_TOKEN
# os.environ['DEEPLAKE_ACCOUNT_NAME']= os.getenv('DEEPLAKE_ACCOUNT_NAME')

embeddings = OpenAIEmbeddings(api_key=constants.API_KEY)
rootdir = "/Users/kavin_jey/Desktop/notepod/backend/data"

docs = []

for subdir, dirs, files in os.walk(rootdir):
    for file in files:
        try:
            loader = TextLoader(os.path.join(subdir, file), encoding='utf-8')
            docs.extend(loader.load())
        except Exception as e:
            print("Could not load file:", e)

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(docs)
username = constants.USERNAME
db = DeepLake(dataset_path=f"hub://{username}/test_db1", embedding_function=embeddings)
db.add_documents(texts)


retriever = db.as_retriever()
retriever.search_kwargs['distance_metric'] = 'cos'
retriever.search_kwargs['fetch_k'] = 100
retriever.search_kwargs['use_maximal_marginal_relevance'] = True
retriever.search_kwargs['k'] = 10

llm = ChatOpenAI(model='gpt-4o')
qa = ConversationalRetrievalChain.from_llm(llm, retriever=retriever)

question = input("Prompt: ")

chat_history = []

while question != 'quit':
    result = qa({"question": question, "chat_history": chat_history})
    chat_history.append((question, result['answer']))
    print(result['answer'])
    question = input("Prompt: ")