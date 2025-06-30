from langchain.embeddings import OllamaEmbeddings
from langchain.vectorstores import FAISS

def create_embeddings(chunk):
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    db = FAISS.from_texts(chunk, embeddings)
    db.save_local("faiss_index")
    return db




