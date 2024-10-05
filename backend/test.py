from langchain.indexes import VectorstoreIndexCreator
import os, shutil
from langchain.globals import set_llm_cache


from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.chains import ConversationalRetrievalChain, RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.cache import InMemoryCache

import constants

from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAI
import warnings

import mimetypes
import git  # pip install gitpython

folder = './data'
# vectorstore = Chroma(persist_directory="persist", embedding_function=OpenAIEmbeddings(api_key=constants.API_KEY))
for filename in os.listdir(folder):
    file_path = os.path.join(folder, filename)
    try:
        if os.path.isfile(file_path) or os.path.islink(file_path):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)
    except Exception as e:
        print('Failed to delete %s. Reason: %s' % (file_path, e))

rootdir = "/Users/kavin_jey/Desktop/notepod/backend/data"
git.Git(rootdir).clone("https://github.com/kavjeydev/AlgoBowl.git")

warnings.filterwarnings('ignore')

textchars = bytearray({7,8,9,10,12,13,27} | set(range(0x20, 0x100)) - {0x7f})
is_binary_string = lambda bytes: bool(bytes.translate(None, textchars))

all_loaders = []
for subdir, dirs, files in os.walk(rootdir):
    for file in files:
        current_file = os.path.join(subdir, file)
        mime = mimetypes.guess_type(current_file)
        # print("File type: ", mime[0])
        if mime[0] != None and mime[0].split('/')[0] == 'text':
            print("File type ", mime[0])
            try:
                loader = TextLoader(current_file)
                all_loaders.append(loader)
            except:
                print("Error loading ", current_file)

os.environ['OPEN_API_KEY'] = constants.API_KEY
llm = ChatOpenAI(model="gpt-4o", api_key=constants.API_KEY, temperature=0, verbose=True)


#TODO TIME RESPONSES FOR SIMILAR QUESTIONS TO CHECK CACHING

embeddings = OpenAIEmbeddings(api_key=constants.API_KEY)

index_creator = VectorstoreIndexCreator(embedding=embeddings)
index = index_creator.from_loaders(all_loaders)

prompt = input("Prompt: ")
while prompt != 'quit':
    result = index.query(llm=llm, question=prompt)
    print(result)
    prompt = input("Prompt: ")

