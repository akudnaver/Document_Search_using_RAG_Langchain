from langchain_community.vectorstores import FAISS
from langchain.embeddings import OllamaEmbeddings

def load_retriever():
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    db = FAISS.load_local("faiss_index", embeddings)
    return db.as_retriever()



