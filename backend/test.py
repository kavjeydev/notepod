from operator import itemgetter
from langchain.indexes import VectorstoreIndexCreator
import os, shutil
from langchain.globals import set_llm_cache
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.chains import ConversationalRetrievalChain, RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.cache import InMemoryCache
import constants
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_openai import OpenAI
import warnings
import mimetypes
import git  # pip install gitpython
from os import listdir
from os.path import isfile, join
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough


rootdir = "/Users/kavin_jey/Desktop/notepod/backend/data"

mypath = 'project_directory'
folder = './data'

warnings.filterwarnings('ignore')

def delete_files(folder):
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))


def pull_git_directory(rootdir):
    git.Git(rootdir).clone("https://github.com/kavjeydev/AlgoBowl.git")

test_loader = DirectoryLoader(rootdir)

def make_all_loaders(rootdir):
    all_loaders = []
    for subdir, dirs, files in os.walk(rootdir):
        for file in files:
            current_file = os.path.join(subdir, file)
            mime = mimetypes.guess_type(current_file)
            # print("File type: ", mime[0])
            if mime[0] != None and mime[0].split('/')[0] == 'text':
                # print("File type ", mime[0])
                try:
                    loader = TextLoader(current_file)
                    all_loaders.append(loader)
                except:
                    print("Error loading ", current_file)

    return all_loaders

all_loaders = make_all_loaders(rootdir)

os.environ['OPEN_API_KEY'] = constants.API_KEY
llm = ChatOpenAI(model="gpt-4o-mini", api_key=constants.API_KEY, temperature=1, verbose=True)

#TODO TIME RESPONSES FOR SIMILAR QUESTIONS TO CHECK CACHING

embeddings = OpenAIEmbeddings(api_key=constants.API_KEY)

index_creator = VectorstoreIndexCreator(embedding=embeddings)
index = index_creator.from_loaders([test_loader])


prompt = "Reference this folder for any questions: " + input("Prompt: ")
while prompt != 'quit':
    result = index.query(llm=llm, question=prompt)
    print(result)
    prompt = input("Prompt: ")

# from langchain_core.messages import HumanMessage


# temp = input("Prompt: ")
# while temp != 'quit':
#     messages = [
#         ("system", "You are an expert in this codebase: {topic}."),
#         HumanMessage(content=temp),
#     ]

#     print("-----Prompt from Template-----")
#     prompt_template = ChatPromptTemplate.from_messages(messages)

#     prompt = prompt_template.invoke({"topic": index.query(llm=llm, question=temp)})
#     result = llm.invoke(prompt)
#     print(result.content)
#     temp = input("Prompt: ")