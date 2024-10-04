from langchain.indexes import VectorstoreIndexCreator
import os

from langchain_openai import OpenAIEmbeddings

import constants

from langchain.document_loaders import TextLoader
from langchain_openai import OpenAI
llm = OpenAI(temperature=0, api_key=constants.API_KEY)

os.environ['OPEN_API_KEY'] = constants.API_KEY

loader1 = TextLoader('./data/something.asm')

embeddings = OpenAIEmbeddings(api_key=constants.API_KEY)

index_creator = VectorstoreIndexCreator(embedding=embeddings)
index = index_creator.from_loaders([loader1])


prompt = input("Prompt: ")
while prompt != 'quit':
    result = index.query(llm=llm, question=prompt)
    print(result)
    prompt = input("Prompt: ")


